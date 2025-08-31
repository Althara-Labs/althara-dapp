import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, getContract } from "viem";
import { sepolia } from "viem/chains";
import { tenderContractAddress, tenderContractABI } from "../../../../lib/contracts/index";

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export async function GET(request: NextRequest) {
  try {
    const contract = getContract({
      address: tenderContractAddress,
      abi: tenderContractABI,
      client,
    });

    // Get total number of tenders
    const totalTenders = await contract.read.getTenderCount();
    const total = Number(totalTenders);

    if (total === 0) {
      return NextResponse.json({
        success: true,
        tenders: [],
      });
    }

    // Fetch all tenders efficiently
    const tenderPromises = [];
    for (let i = 0; i < total; i++) {
      tenderPromises.push(contract.read.getTender([BigInt(i)]));
    }

    const tenderResults = await Promise.all(tenderPromises);
    
    const tenders = tenderResults.map((tender, index) => ({
      id: index,
      description: tender[0],
      budget: tender[1],
      requirementsCid: tender[2],
      government: tender[3],
      isActive: tender[4],
      createdAt: tender[5],
    }));

    return NextResponse.json({
      success: true,
      tenders,
    });

  } catch (error) {
    console.error("Error fetching tenders:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenders" },
      { status: 500 }
    );
  }
}
