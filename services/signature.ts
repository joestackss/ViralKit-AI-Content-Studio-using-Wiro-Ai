import CryptoJS from "crypto-js";
import { SignatureData, WiroAuthHeaders } from "../types";
import { WIRO_CONFIG } from "../utils/constants";

/**
 * Generate HMAC SHA256 signature for Wiro API authentication
 * The signature must be regenerated for each API request
 */
export function generateSignature(): SignatureData {
  // Get current timestamp as nonce
  const plainNonce = new Date().getTime().toString();

  // Generate HMAC SHA256 signature
  const signatureHex = CryptoJS.HmacSHA256(
    WIRO_CONFIG.API_SECRET + plainNonce,
    WIRO_CONFIG.API_KEY
  ).toString();

  return {
    nonce: plainNonce,
    signature: signatureHex,
  };
}

/**
 * Generate authentication headers for multipart/form-data requests
 * Used for image upload endpoints (try-on, video generation)
 */
export function generateMultipartHeaders(): WiroAuthHeaders {
  const { nonce, signature } = generateSignature();

  return {
    "x-api-key": WIRO_CONFIG.API_KEY,
    "x-nonce": nonce,
    "x-signature": signature,
    "Content-Type": "multipart/form-data",
  };
}

/**
 * Generate authentication headers for JSON requests
 * Used for text-based endpoints (caption generation)
 */
export function generateJSONHeaders(): WiroAuthHeaders {
  const { nonce, signature } = generateSignature();

  return {
    "x-api-key": WIRO_CONFIG.API_KEY,
    "x-nonce": nonce,
    "x-signature": signature,
    "Content-Type": "application/json",
  };
}
