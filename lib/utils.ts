import { ethers } from "ethers";

/**
 * Convert ETH to Wei
 */
export function ethToWei(eth: string | number): bigint {
  return ethers.parseEther(eth.toString());
}

/**
 * Convert Wei to ETH
 */
export function weiToEth(wei: bigint | string): string {
  return ethers.formatEther(wei.toString());
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Validate file type
 */
export function isValidFileType(file: File): boolean {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ];
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size (10MB limit)
 */
export function isValidFileSize(file: File): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSize;
}

/**
 * Get GOVERNMENT_ROLE hash
 */
export function getGovernmentRoleHash(): string {
  return "0x71840dc4906352362b0cdaf79870196c8e42acafade72d5d5a6d59291253dce1";
}

/**
 * Format tender description for contract
 */
export function formatTenderDescription(
  title: string,
  description: string,
  deadline: string,
  status: string
): string {
  return `${title}|${description}|Deadline: ${deadline}|Status: ${status}`;
}

/**
 * Parse tender description from contract
 */
export function parseTenderDescription(description: string): {
  title: string;
  description: string;
  deadline: string;
  status: string;
} {
  const parts = description.split("|");
  return {
    title: parts[0] || "",
    description: parts[1] || "",
    deadline: parts[2]?.replace("Deadline: ", "") || "",
    status: parts[3]?.replace("Status: ", "") || ""
  };
}

/**
 * Get current timestamp
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Check if date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Generate a random string for testing
 */
export function generateRandomString(length: number = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}

/**
 * Validate Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Get network name from chain ID
 */
export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1:
      return "Ethereum Mainnet";
    case 11155111:
      return "Sepolia Testnet";
    case 314159:
      return "Filecoin Calibration";
    default:
      return `Chain ID ${chainId}`;
  }
}
