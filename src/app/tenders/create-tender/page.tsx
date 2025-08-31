"use client";

import { useState, useEffect } from "react";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { useRouter } from "next/navigation";
import { tenderContractAddress, tenderContractABI } from "../../../../lib/contracts/index";
// GOVERNMENT_ROLE hash - keccak256 hash of "GOVERNMENT_ROLE"
const GOVERNMENT_ROLE = "0x71840dc4906352362b0cdaf79870196c8e42acafade72d5d5a6d59291253dce1";

export default function CreateTender() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("open");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [requirementsCid, setRequirementsCid] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isGovernment, setIsGovernment] = useState<boolean | null>(null);

  // Check if user has GOVERNMENT_ROLE
  const { data: hasGovernmentRole, isLoading: roleLoading } = useContractRead({
    address: tenderContractAddress,
    abi: tenderContractABI,
    functionName: "hasRole",
    args: [GOVERNMENT_ROLE, address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Get service fee
  const { data: serviceFee } = useContractRead({
    address: tenderContractAddress,
    abi: tenderContractABI,
    functionName: "serviceFee",
    query: {
      enabled: isConnected,
    },
  });

  // Check if user has DEFAULT_ADMIN_ROLE (temporary for debugging)
  const { data: hasAdminRole } = useContractRead({
    address: tenderContractAddress,
    abi: tenderContractABI,
    functionName: "hasRole",
    args: ["0x0000000000000000000000000000000000000000000000000000000000000000", address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: isConnected && !!address,
    },
  });

  useEffect(() => {
    if (hasGovernmentRole !== undefined) {
      setIsGovernment(!!hasGovernmentRole);
    }
  }, [hasGovernmentRole]);

  // Contract write for createTender
  const { writeContract: createTender, isSuccess: isTenderCreated, isPending: isCreating } = useContractWrite();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploadLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      console.log('API response type:', typeof data);
      console.log('CID property:', data.cid);
      console.log('CID property type:', typeof data.cid);
      
      if (data.cid) {
        console.log('CID received:', data.cid, 'Type:', typeof data.cid);
        console.log('CID JSON stringified:', JSON.stringify(data.cid));
        const cidString = String(data.cid); // Ensure CID is a string
        console.log('CID as string:', cidString, 'Type:', typeof cidString);
        setRequirementsCid(cidString);
        setSuccess(`Document uploaded successfully! CID: ${cidString}`);
      } else {
        const errorMessage = typeof data.error === 'string' ? data.error : "Upload failed - no CID returned";
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Error uploading file";
      setError(errorMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!requirementsCid) {
      setError("Please upload documents first");
      return;
    }

    if (!title || !description || !budget || !deadline) {
      setError("Please fill in all required fields");
      return;
    }

    setError(null);

    try {
      createTender({
        address: tenderContractAddress,
        abi: tenderContractABI,
        functionName: "createTender",
        args: [
          `${title}|${description}|Deadline: ${deadline}|Status: ${status}`,
          budget ? BigInt(parseFloat(budget) * 10 ** 18) : BigInt(0),
          requirementsCid || ""
        ],
        value: serviceFee || BigInt(10 ** 16), // 0.01 ETH default
      });
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to create tender");
    }
  };

  useEffect(() => {
    if (isTenderCreated) {
      setSuccess("Tender created successfully!");
      
      // Invalidate cache to ensure new tender appears in listing
      fetch('/api/tenders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'invalidate-cache' }),
      }).catch(err => console.error('Failed to invalidate cache:', err));
      
      // Reset form
      setTitle("");
      setDescription("");
      setBudget("");
      setDeadline("");
      setFile(null);
      setRequirementsCid("");
    }
  }, [isTenderCreated]);

  // Loading state while checking role
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Checking permissions...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Create Tender</h1>
          <p className="text-gray-600 mb-4">Please connect your wallet to continue.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">You need to connect your wallet first to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authorized state
  if (isGovernment === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-medium">Only government users with the GOVERNMENT_ROLE can create tenders.</p>
            <p className="text-red-600 text-sm mt-2">Connected address: {address}</p>
          </div>
          
          {/* Debug Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Information:</h3>
            <p className="text-blue-600 text-sm">Government Role: {hasGovernmentRole ? "✅ Yes" : "❌ No"}</p>
            <p className="text-blue-600 text-sm">Admin Role: {hasAdminRole ? "✅ Yes" : "❌ No"}</p>
            <p className="text-blue-600 text-sm">Connected: {isConnected ? "✅ Yes" : "❌ No"}</p>
          </div>
          
          <p className="text-gray-600">Please contact the administrator to get GOVERNMENT_ROLE access. We do this to prevent spam in the DApp.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo - Links to landing page */}
            <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Althara Pacta</span>
            </a>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <a 
                href="/tenders"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                View Tenders
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
                         <h1 className="text-4xl font-bold text-black mb-3">Create New Tender</h1>
             <p className="text-black text-lg max-w-2xl mx-auto">Fill in the details below to create a new tender for vendors to bid on. All information will be stored securely on the blockchain.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left Column - Form Fields */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                 <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
                   <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   Tender Information
                 </h2>
                <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-black mb-2">
                       Tender Title *
                     </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter tender title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                       Status
                     </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="awarded">Awarded</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-black mb-2">
                       Description *
                     </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide detailed description of the tender requirements"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                       Budget (ETH) *
                     </label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="0.0"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      required
                    />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-black mb-2">
                       Government Address
                     </label>
                    <input
                      type="text"
                      value={address || ""}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                       Submission Deadline *
                     </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - File Upload and Actions */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                                 <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
                   <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                   </svg>
                   Document Upload & Submission
                 </h2>
                <div className="space-y-4">
                  <div>
                                         <label className="block text-sm font-medium text-black mb-2">
                       Official Documents *
                     </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors duration-200">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.txt"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="space-y-2">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                             <div className="text-black">
                             <span className="font-medium">Click to upload</span> or drag and drop
                           </div>
                          <p className="text-xs text-gray-500">PDF, DOC, DOCX, or TXT up to 10MB</p>
                        </div>
                      </label>
                    </div>
                                         {file && (
                       <div className="mt-2 text-sm text-black bg-blue-50 rounded-lg p-2">
                         <span className="font-medium">Selected:</span> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                       </div>
                     )}
                  </div>

                               </div>

                 <button
                   onClick={handleUpload}
                   disabled={uploadLoading || !file}
                   className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                 >
                   {uploadLoading ? (
                     <div className="flex items-center justify-center">
                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                       Uploading to Filecoin...
                     </div>
                   ) : (
                     "Upload Documents to Filecoin"
                   )}
                 </button>

                                   {requirementsCid && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-green-800 mb-2">Upload Successful!</h3>
                      <p className="text-xs text-green-700 break-all">CID: {String(requirementsCid)}</p>
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <button
                          onClick={() => router.push('/tenders')}
                          className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          ← Back to Tenders
                        </button>
                      </div>
                    </div>
                  )}

                 <div className="border-t pt-6">
                   <div className="bg-gray-50 rounded-lg p-4 mb-4">
                     <h3 className="text-sm font-medium text-black mb-2">Service Fee</h3>
                     <p className="text-sm text-black">
                       {serviceFee ? `${Number(serviceFee) / 10 ** 18} ETH` : "0.01 ETH"} will be charged for creating this tender.
                     </p>
                   </div>

                   <button
                     onClick={handleSubmit}
                     disabled={isCreating || !requirementsCid || !title || !description || !budget || !deadline}
                     className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                   >
                     {isCreating ? (
                       <div className="flex items-center justify-center">
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                         Creating Tender...
                       </div>
                     ) : (
                       "Create Tender"
                     )}
                   </button>
                 </div>
               </div>
             </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{String(error)}</p>
            </div>
          )}

          {success && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">{String(success)}</p>
              {success.includes("Tender created successfully") && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => router.push('/tenders')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View All Tenders
                  </button>
                  <button
                    onClick={() => {
                      setSuccess(null);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Create Another Tender
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
   </div>
  );
}