"use client";

import { useState, useEffect } from "react";
import { useAccount, useContractRead, useWriteContract } from "wagmi";
import { tenderContractAddress, tenderContractABI } from "../../../lib/contracts/index";

// Role hashes
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
const GOVERNMENT_ROLE = "0x71840dc4906352362b0cdaf79870196c8e42acafade72d5d5a6d59291253dce1" as `0x${string}`;

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [newAddress, setNewAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>(GOVERNMENT_ROLE);
  const [successMessage, setSuccessMessage] = useState("");

  // Check if user has admin role
  const { data: hasAdminRole, isLoading: adminLoading } = useContractRead({
    address: tenderContractAddress,
    abi: tenderContractABI,
    functionName: "hasRole",
    args: [DEFAULT_ADMIN_ROLE, address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Grant role function
  const { writeContract: grantRole, isPending: isGranting, error: writeError, isSuccess } = useWriteContract();

  const handleGrantRole = () => {
    if (!newAddress || !newAddress.startsWith("0x")) {
      alert("Please enter a valid Ethereum address");
      return;
    }

    console.log("Granting role:", {
      role: selectedRole,
      address: newAddress,
      contractAddress: tenderContractAddress
    });

    console.log("grantRole function:", grantRole);
    console.log("grantRole type:", typeof grantRole);

    setSuccessMessage("");

    if (!grantRole) {
      console.error("grantRole function is not available");
      alert("Contract write function not available. Please try refreshing the page.");
      return;
    }

    try {
      // Try the new wagmi v2 syntax
      grantRole({
        address: tenderContractAddress,
        abi: tenderContractABI,
        functionName: "grantRole",
        args: [selectedRole as `0x${string}`, newAddress as `0x${string}`],
      });
    } catch (error) {
      console.error("Error granting role:", error);
      alert("Failed to grant role. Please try again.");
    }
  };

  // Show success message when role is granted
  useEffect(() => {
    if (isSuccess) {
      setSuccessMessage("Role granted successfully!");
    }
  }, [isSuccess]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
          <p className="text-gray-600">Please connect your wallet to continue.</p>
        </div>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Checking admin permissions...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAdminRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">You don&apos;t have admin permissions.</p>
            <p className="text-red-600 text-sm mt-2">Address: {address}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Grant Role</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Role
                  </label>
                                     <select
                     value={selectedRole}
                     onChange={(e) => setSelectedRole(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value={GOVERNMENT_ROLE}>Government Role</option>
                     <option value={DEFAULT_ADMIN_ROLE}>Admin Role</option>
                   </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleGrantRole}
                  disabled={isGranting || !newAddress}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isGranting ? "Granting Role..." : "Grant Role"}
                </button>

                {writeError && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">Error: {writeError.message}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm">{successMessage}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Current Admin</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Address:</span> {address}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Admin Role:</span> ✅ Yes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
