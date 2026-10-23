/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  AlertOctagon,
  RefreshCw,
  Lock,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';
import {
  BLOCKCHAIN_ADDRESS,
  verifyOnChain,
  VerificationResult,
} from '../services/api';

interface BlockchainPanelProps {
  selectedHash?: string;
}

export const BlockchainPanel: React.FC<BlockchainPanelProps> = ({
  selectedHash,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [currentHash, setCurrentHash] = useState<string>(
    selectedHash || '0x8f2d65c401b876e93ca910fa3e56bc7492193b2a1a89c72e2d9b4f61c37b018e'
  );
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [tamperMode, setTamperMode] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    if (selectedHash) {
      setCurrentHash(selectedHash);
    }
  }, [selectedHash]);

  const handleVerify = async (hashToVerify: string, forceTamper: boolean) => {
    setIsVerifying(true);
    try {
      const res = await verifyOnChain(hashToVerify, forceTamper);
      setResult(res);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    handleVerify(currentHash, tamperMode);
  }, [currentHash, tamperMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(BLOCKCHAIN_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = `${BLOCKCHAIN_ADDRESS.slice(0, 6)}...${BLOCKCHAIN_ADDRESS.slice(-4)}`;

  return (
    <section id="blockchain" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-14">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5DFD5] text-xs text-[#57534E] mb-3 shadow-xs">
          <Lock className="w-3.5 h-3.5 text-[#1E3A8A]" />
          <span className="font-medium">Decentralized Proof Layer</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-space text-[#18181B] tracking-tight mb-3">
          Blockchain Verification Ledger
        </h2>
        <p className="text-base text-[#57534E] max-w-2xl text-balance">
          Every malicious payload and critical sensor alert is irrevocably committed to an on-chain ledger, ensuring zero posthumous log alterations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Smart Contract Identity */}
        <div className="lg:col-span-1 p-6 rounded-xl bg-white border border-[#E5DFD5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#1E3A8A]/10 border border-[#1E3A8A]/30 flex items-center justify-center text-[#1E3A8A]">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#18181B] font-space">
                  Registry Smart Contract
                </h3>
                <p className="text-xs text-[#57534E]">
                  Arbitrum L2 Security Rollup
                </p>
              </div>
            </div>

            {/* Truncated Address + Copy */}
            <div className="p-4 rounded-lg bg-[#F5F2EB] border border-[#E5DFD5] mb-6">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#57534E] mb-2 flex items-center justify-between font-semibold">
                <span>Contract Address</span>
                <span className="text-emerald-700 font-bold">EVM Verified</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-[#18181B] tracking-wide select-all font-semibold">
                  {truncatedAddress}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-[#FAF7F2] text-xs font-mono text-[#57534E] hover:text-[#18181B] border border-[#E5DFD5] transition-colors cursor-pointer shadow-xs"
                  title="Copy full contract address"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Immutability Invariants */}
            <div className="space-y-3 text-xs text-[#57534E]">
              <div className="flex items-center justify-between py-1.5 border-b border-[#E5DFD5]">
                <span>State Consensus</span>
                <span className="font-mono text-[#18181B] font-semibold">Byzantine Fault Tolerant</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E5DFD5]">
                <span>Cryptographic Digest</span>
                <span className="font-mono text-[#18181B] font-semibold">Keccak-256 / SHA-256</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E5DFD5]">
                <span>Audit Latency</span>
                <span className="font-mono text-[#18181B] font-semibold">&lt; 1 Block (~250ms)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#E5DFD5] text-[11px] text-[#78716C]">
            Connected via <code className="text-[#1E3A8A] font-semibold">services/api.ts</code> (placeholder for Python Web3 provider).
          </div>
        </div>

        {/* Right Columns: Incident Verification Console */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-[#E5DFD5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E5DFD5]">
              <div>
                <h3 className="text-base font-bold text-[#18181B] font-space flex items-center gap-2">
                  <span>Incident Hash Verification</span>
                  {result && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                        result.verified
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 text-[#E31B23] border border-red-300 animate-pulse'
                      }`}
                    >
                      {result.verified ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Verified ✓</span>
                        </>
                      ) : (
                        <>
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Mismatch (Tampered) ✗</span>
                        </>
                      )}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#57534E] mt-1">
                  Query the blockchain registry to validate proof-of-incident integrity
                </p>
              </div>

              {/* Tamper Test Simulator Toggle */}
              <button
                onClick={() => setTamperMode(!tamperMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border cursor-pointer ${
                  tamperMode
                    ? 'bg-red-50 border-[#E31B23] text-[#E31B23]'
                    : 'bg-[#F5F2EB] border-[#E5DFD5] text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate Payload Tamper: {tamperMode ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Hash Input Bar */}
            <div className="mb-6">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#57534E] mb-2 font-semibold">
                Active Incident Digest Hash
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentHash}
                  onChange={(e) => setCurrentHash(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 px-4 py-2 text-xs font-mono bg-[#F5F2EB] border border-[#E5DFD5] rounded-lg text-[#18181B] focus:outline-none focus:border-[#E31B23]"
                />
                <button
                  onClick={() => handleVerify(currentHash, tamperMode)}
                  disabled={isVerifying}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#2563EB] disabled:opacity-50 rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>Verify</span>
                </button>
              </div>
            </div>

            {/* Verification Result Details */}
            {result && (
              <div
                className={`p-5 rounded-lg border transition-all ${
                  result.verified
                    ? 'bg-[#FAF7F2] border-emerald-300'
                    : 'bg-red-50/60 border-red-300'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#57534E] block mb-1">Status Verdict</span>
                    <span
                      className={`font-bold text-sm ${
                        result.verified ? 'text-emerald-700' : 'text-[#E31B23]'
                      }`}
                    >
                      {result.verified
                        ? 'AUTHENTIC RECORD CONFIRMED'
                        : 'HASH MISMATCH: TAMPER DETECTED'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#57534E] block mb-1">Block Height</span>
                    <span className="text-[#18181B] tabular-nums font-semibold">
                      #{result.blockNumber.toLocaleString()}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[#57534E] block mb-1">On-Chain Tx Receipt</span>
                    <span className="text-[#1E3A8A] break-all text-[11px] font-semibold">
                      {result.chainTx}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[#57534E] block mb-1">Merkle Proof Root</span>
                    <span className="text-[#57534E] break-all text-[11px]">
                      {result.merkleRoot}
                    </span>
                  </div>
                </div>

                {!result.verified && (
                  <div className="mt-4 p-3 rounded bg-red-100/80 border border-red-300 text-xs text-[#18181B]">
                    <strong>Security Warning:</strong> The hash submitted does not match the
                    canonical state registered on the Arbitrum smart contract at block #{result.blockNumber}.
                    This indicates external alteration of the raw telemetry or falsified alert logs.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-[#57534E]">
            <span>Algorithm: SHA-256 + ECDSA secp256k1</span>
            <span className="text-emerald-700 font-semibold">Zero-Knowledge Attestation Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};
