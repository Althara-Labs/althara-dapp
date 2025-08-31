
"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { sepolia } from "@wagmi/core/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Image from "next/image";

// Disable SSR for this component to avoid wagmi serialization issues
const ConnectWalletComponent = () => {
  const { isConnected, address, chainId } = useAccount();
  const { error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [, setIsRegistered] = useState(false);


  const [governmentName, setGovernmentName] = useState("");
  const [headOfTenders, setHeadOfTenders] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (isConnected && chainId) {
      setIsCorrectNetwork(chainId === sepolia.id);
      // Check if user is already registered (simulate with localStorage for now)
      const registeredUser = localStorage.getItem(`government_${address}`);
      if (registeredUser) {
        setIsRegistered(true);
        const userData = JSON.parse(registeredUser);
        setGovernmentName(userData.governmentName);
      } else {
        setIsOnboarding(true);
      }
    }
  }, [isConnected, chainId, address]);



  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
    } catch (error) {
      console.error("Network switch error:", error);
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address) {
      const userData = {
        governmentName,
        headOfTenders,
        location,
        address,
        registeredAt: new Date().toISOString()
      };
      localStorage.setItem(`government_${address}`, JSON.stringify(userData));
      setIsRegistered(true);
      setIsOnboarding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header with Logo */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Image 
                src="/althara pacta logo.png" 
                alt="Althara Pacta" 
                width={32} 
                height={32}
                className="rounded-lg"
              />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-white">Althara Pacta</h1>
              <p className="text-blue-100 text-sm">Government Portal</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
          <p className="text-blue-100 mt-2">Access the transparent tendering platform</p>
        </div>

        {/* Wallet Connection Section */}
        <div className="p-6">
          {!isConnected ? (
            <>
              <div className="space-y-3 mb-6">
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
              
              {connectError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600 text-sm text-center">{connectError.message}</p>
                </div>
              )}

              <div className="mt-6">
                <Link 
                  href="/" 
                  className="block w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors text-center select-none"
                >
                  ← Back to Home
                </Link>
              </div>
            </>
          ) : isOnboarding ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome!</h3>
                <p className="text-gray-600 text-sm">Please complete your government registration</p>
              </div>

              <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Government Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={governmentName}
                    onChange={(e) => setGovernmentName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Municipality of Cartago, Costa Rica"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Head of Tenders *
                  </label>
                  <input
                    type="text"
                    required
                    value={headOfTenders}
                    onChange={(e) => setHeadOfTenders(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Cartago, Costa Rica"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm text-center">
                    <strong>Note:</strong> Official verification coming soon
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors cursor-pointer select-none"
                >
                  Complete Registration
                </button>
              </form>

              <div className="mt-6">
                <Link 
                  href="/" 
                  className="block w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors text-center select-none"
                >
                  ← Back to Home
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome back!</h3>
                <p className="text-gray-600 text-sm font-semibold mb-2">{governmentName}</p>
                <p className="text-gray-600 text-sm font-mono bg-gray-100 rounded-lg p-2 break-all">
                  {address}
                </p>
              </div>

              {!isCorrectNetwork && (
                <button
                  onClick={handleSwitchNetwork}
                  className="w-full py-3 px-6 mb-4 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 active:bg-yellow-700 transition-colors cursor-pointer select-none"
                >
                  Switch to Sepolia Network
                </button>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => disconnect()}
                  className="w-full py-3 px-6 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 active:bg-red-700 transition-colors cursor-pointer select-none"
                >
                  Disconnect Wallet
                </button>
                <Link 
                  href="/government-settings" 
                  className="block w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors text-center select-none"
                >
                  → Government Settings
                </Link>
                <Link 
                  href="/tenders" 
                  className="block w-full py-3 px-6 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition-colors text-center select-none"
                >
                  📋 Browse Tenders
                </Link>
              </div>
              <div className="mt-6">
                <Link 
                  href="/" 
                  className="block w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors text-center select-none"
                >
                  ← Back to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConnectWalletComponent;