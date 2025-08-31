"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import Image from "next/image";

interface Tender {
  id: string;
  title: string;
  description: string;
  budget: string;
  deadline: string;
  government: string;
  status: 'open' | 'closed' | 'awarded';
  wallet: string;
}

type UserData = {
  governmentName?: string;
  organizationName?: string;
  address: string;
  registeredAt: string;
};

export default function TendersPage() {
  const { isConnected, address } = useAccount();
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState<'government' | 'vendor' | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isJustLooking, setIsJustLooking] = useState(false);

  // Sample tenders data
  const [tenders] = useState<Tender[]>([
    {
      id: "1",
      title: "City Hall Renovation Project",
      description: "Complete renovation of the main city hall building including electrical, plumbing, and structural improvements.",
      budget: "$2,500,000",
      deadline: "2024-02-15",
      government: "City of New York",
      status: "open",
      wallet: "0x1234567890abcdef"
    },
    {
      id: "2", 
      title: "Public Library IT Infrastructure",
      description: "Upgrade of computer systems, network infrastructure, and digital services for the public library system.",
      budget: "$800,000",
      deadline: "2024-01-30",
      government: "City of Boston",
      status: "open",
      wallet: "0xabcdef1234567890"
    },
    {
      id: "3",
      title: "Municipal Waste Management System",
      description: "Implementation of smart waste collection and recycling system for the municipality.",
      budget: "$1,200,000", 
      deadline: "2024-03-01",
      government: "City of Chicago",
      status: "closed",
      wallet: "0x9876543210fedcba"
    }
  ]);

  useEffect(() => {
    if (isConnected && address) {
      // Check if user is government or vendor
      const governmentData = localStorage.getItem(`government_${address}`);
      const vendorData = localStorage.getItem(`vendor_${address}`);
      
      if (governmentData) {
        setUserType('government');
        setUserData(JSON.parse(governmentData));
      } else if (vendorData) {
        setUserType('vendor');
        setUserData(JSON.parse(vendorData));
      }
    }
  }, [isConnected, address]);

  const filteredTenders = tenders.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase()) ||
    item.government.toLowerCase().includes(search.toLowerCase()) ||
    item.wallet.toLowerCase().includes(search.toLowerCase())
  );

  if (!isConnected && !isJustLooking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect to View Tenders</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to browse and interact with tenders.</p>
          <div className="space-y-3">
            <Link 
              href="/connect-wallet-government" 
              className="block w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Connect as Government
            </Link>
            <Link 
              href="/connect-wallet-vendor" 
              className="block w-full py-3 px-6 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Connect as Vendor
            </Link>
            <button
              onClick={() => setIsJustLooking(true)}
              className="block w-full py-3 px-6 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              👀 Just Looking
            </button>
            <Link 
              href="/" 
              className="block w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Image 
                  src="/althara pacta logo.png" 
                  alt="Althara Pacta" 
                  width={24} 
                  height={24}
                  className="rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tenders</h1>
                <p className="text-sm text-gray-600">
                  {isJustLooking ? 'Browse tenders (Read-only mode)' : 
                   userType === 'government' ? 'Manage your tenders' : 'Browse available tenders'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isJustLooking ? (
                <>
                  <button
                    onClick={() => setIsJustLooking(false)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    🔐 Connect Wallet
                  </button>
                  <Link 
                    href="/" 
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    ← Home
                  </Link>
                </>
              ) : (
                <>
                  {userType === 'government' && (
                    <Link 
                      href="/create-tender"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      ➕ Create Tender
                    </Link>
                  )}
                  {userType === 'vendor' && (
                    <Link 
                      href="/my-bids"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      💼 My Bids
                    </Link>
                  )}
                  <Link 
                    href="/" 
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    ← Home
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tenders by title, description, or government..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900">
                <option value="" className="text-gray-500">All Status</option>
                <option value="open" className="text-gray-900">Open</option>
                <option value="closed" className="text-gray-900">Closed</option>
                <option value="awarded" className="text-gray-900">Awarded</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Info Banner */}
        {isJustLooking ? (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-900">Read-Only Mode</p>
                  <p className="text-xs text-purple-700">You&apos;re browsing tenders without connecting a wallet</p>
                </div>
              </div>
              <button
                onClick={() => setIsJustLooking(false)}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                Connect Wallet →
              </button>
            </div>
          </div>
        ) : userData && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Logged in as: <span className="font-semibold text-gray-900">
                    {userType === 'government' ? userData.governmentName : userData.organizationName}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {userType === 'government' ? 'Government Portal' : 'Vendor Portal'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Wallet</p>
                <p className="text-xs font-mono text-gray-600">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tenders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenders.map((tender) => (
            <div key={tender.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{tender.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    tender.status === 'open' ? 'bg-green-100 text-green-800' :
                    tender.status === 'closed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tender.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Budget:</span>
                    <span className="font-semibold text-gray-900">{tender.budget}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Government:</span>
                    <span className="font-semibold text-gray-900">{tender.government}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deadline:</span>
                    <span className="font-semibold text-gray-900">{new Date(tender.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isJustLooking ? (
                    <>
                      <button className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
                        🔐 Connect to Interact
                      </button>
                      <button className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm">
                        View Details
                      </button>
                    </>
                  ) : (
                    <>
                      {userType === 'government' && tender.wallet === address && (
                        <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
                          Manage Tender
                        </button>
                      )}
                      {userType === 'vendor' && tender.status === 'open' && (
                        <button className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
                          Submit Bid
                        </button>
                      )}
                      <button className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm">
                        View Details
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTenders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenders found</h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}