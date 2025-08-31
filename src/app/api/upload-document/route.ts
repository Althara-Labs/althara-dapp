import { NextRequest, NextResponse } from "next/server";
import { Synapse, RPC_URLS, TOKENS, CONTRACT_ADDRESSES } from "@filoz/synapse-sdk";
import { ethers } from "ethers";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed" },
        { status: 400 }
      );
    }

    // Check if PRIVATE_KEY is available
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error("PRIVATE_KEY environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);

    // Initialize Synapse SDK with Calibration testnet
    const synapse = await Synapse.create({
      privateKey: privateKey,
      rpcURL: RPC_URLS.calibration.http, // Use Calibration testnet HTTP endpoint
    });

    console.log("Synapse SDK initialized successfully");

    // Check if we need to set up payments
    try {
      // Try to create storage service directly first
      const storage = await synapse.createStorage();
      console.log("Storage service created successfully");

      // Upload data to Filecoin
      const uploadResult = await storage.upload(data);

      if (!uploadResult.commp) {
        throw new Error("Upload failed - no CID returned from Filecoin");
      }

      console.log(`File uploaded successfully. CID: ${uploadResult.commp}`);
      
      return NextResponse.json({
        cid: String(uploadResult.commp), // Ensure CID is a string
        filename: file.name,
        size: file.size,
        type: file.type
      });

    } catch (storageError) {
      console.log("Storage service creation failed, attempting payment setup...");
      
      // If storage creation fails, we need to set up payments
      try {
                 // 1. Deposit USDFC tokens (one-time setup) - using available balance
         const depositAmount = ethers.parseUnits('5', 18); // 5 USDFC (reduced from 100)
         console.log("Depositing USDFC tokens...");
         const depositTx = await synapse.payments.deposit(depositAmount, TOKENS.USDFC);
        console.log(`Deposit transaction: ${depositTx.hash}`);
        await depositTx.wait();
        console.log("Deposit confirmed");

                 // 2. Approve the Pandora service for automated payments - reduced amounts
         const pandoraAddress = CONTRACT_ADDRESSES.PANDORA_SERVICE[synapse.getNetwork()];
         console.log("Approving Pandora service...");
         const approveTx = await synapse.payments.approveService(
           pandoraAddress,
           ethers.parseUnits('1', 18),    // Rate allowance: 1 USDFC per epoch (reduced)
           ethers.parseUnits('5', 18)     // Lockup allowance: 5 USDFC total (reduced)
         );
        console.log(`Service approval transaction: ${approveTx.hash}`);
        await approveTx.wait();
        console.log("Service approval confirmed");

        // 3. Now try to create storage service again
        const storage = await synapse.createStorage();
        console.log("Storage service created successfully after payment setup");

        // 4. Upload data to Filecoin
        const uploadResult = await storage.upload(data);

        if (!uploadResult.commp) {
          throw new Error("Upload failed - no CID returned from Filecoin");
        }

        console.log(`File uploaded successfully. CID: ${uploadResult.commp}`);
        
        return NextResponse.json({
          cid: String(uploadResult.commp), // Ensure CID is a string
          filename: file.name,
          size: file.size,
          type: file.type
        });

      } catch (paymentError) {
        console.error("Payment setup failed:", paymentError);
        return NextResponse.json(
          { error: "Payment setup failed. Please ensure your wallet has sufficient FIL and USDFC tokens on Calibration testnet." },
          { status: 402 }
        );
      }
    }

  } catch (error) {
    console.error("Upload error:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("private key")) {
        return NextResponse.json(
          { error: "Invalid private key configuration" },
          { status: 500 }
        );
      }
      
      if (error.message.includes("network") || error.message.includes("connection")) {
        return NextResponse.json(
          { error: "Network error - unable to connect to Filecoin network" },
          { status: 503 }
        );
      }

      if (error.message.includes("insufficient funds") || error.message.includes("balance")) {
        return NextResponse.json(
          { error: "Insufficient funds for Filecoin storage. Please ensure your wallet has FIL and USDFC tokens on Calibration testnet." },
          { status: 402 }
        );
      }

      if (error.message.includes("createStorage failed")) {
        return NextResponse.json(
          { error: "Storage service setup failed. This may require additional configuration or tokens." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Upload failed. Please try again later." },
      { status: 500 }
    );
  }
}
