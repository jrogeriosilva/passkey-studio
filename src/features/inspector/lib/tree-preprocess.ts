/**
 * Tree preprocessing pipeline: transforms typed DecodeResult objects
 * into display-ready plain JSON for react-json-view-lite rendering.
 *
 * Applies display rules from 03-UI-SPEC.md §Pre-Processing Display Rules:
 * - Uint8Array -> hex string
 * - CoseKeyInfo fields -> "raw (name)" format
 * - AAGUID -> UUID + optional authenticator name
 * - AuthDataFlags -> plain object with hex rawByte
 *
 * No console.log/debug of payload bytes per T-03-05.
 */

import type {
  DecodeResult,
  DecodedAuthData,
  DecodedAssertion,
  DecodedClientDataJSON,
  DecodedPublicKeyCredential,
  CoseKeyInfo,
  AuthDataFlags,
} from "@/inspector/lib/types";
import { bytesToUuid, resolveAaguid } from "@/inspector/lib/aaguid-registry";

import { base64 } from "@hexagon/base64";

const MAX_RECURSION_DEPTH = 32;

/** Convert Uint8Array to a display-friendly hex string. */
export function bytesToDisplayHex(bytes: Uint8Array): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex;
}

export function preprocessForTree(result: DecodeResult, encoding: "hex" | "base64url" = "hex"): { tree: Record<string, unknown> } {
  const bytesToDisplay = (bytes: Uint8Array) => encoding === "hex" ? bytesToDisplayHex(bytes) : base64.fromArrayBuffer(new Uint8Array(bytes).buffer, true);

  /** Format AAGUID bytes as UUID string with optional authenticator name. */
  function formatAaguid(bytes: Uint8Array): string {
    const uuid = bytesToUuid(bytes);
    const name = resolveAaguid(bytes);
    if (name) {
      return `${uuid} -> ${name}`;
    }
    return uuid;
  }

  /**
   * Format CoseKeyInfo into a display-ready plain object.
   * Each {raw, name} field becomes "raw (name)".
   */
  function formatCoseKey(
    key: CoseKeyInfo
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {
      kty: `${key.kty.raw} (${key.kty.name})`,
      alg: `${key.alg.raw} (${key.alg.name})`,
    };
    if (key.crv) {
      result.crv = `${key.crv.raw} (${key.crv.name})`;
    }
    // Include rawEntries with Uint8Array conversion
    if (Object.keys(key.rawEntries).length > 0) {
      result.rawEntries = deepConvert(key.rawEntries, 0);
    }
    return result;
  }

  /**
   * Format AuthDataFlags into a display-ready plain object.
   * Boolean fields pass through, rawByte becomes hex string.
   */
  function formatFlags(flags: AuthDataFlags): Record<string, unknown> {
    return {
      up: flags.up,
      uv: flags.uv,
      be: flags.be ?? false,
      bs: flags.bs ?? false,
      at: flags.at,
      ed: flags.ed,
      rawByte: `0x${flags.rawByte.toString(16).padStart(2, "0")}`,
    };
  }

  /**
   * Deep-convert an arbitrary value, replacing Uint8Array with hex strings
   * and Map with plain objects. Depth-bounded to MAX_RECURSION_DEPTH (T-03-02).
   */
  function deepConvert(value: unknown, depth: number): unknown {
    if (depth > MAX_RECURSION_DEPTH) {
      return "[depth limit reached]";
    }

    if (typeof value === "bigint") return value.toString();
    if (value === undefined) return "undefined (CBOR)";

    if (value instanceof Uint8Array) {
      return bytesToDisplay(value);
    }

    if (value instanceof Map) {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of value.entries()) {
        obj[String(k)] = deepConvert(v, depth + 1);
      }
      return obj;
    }

    if (Array.isArray(value)) {
      return value.map((item) => deepConvert(item, depth + 1));
    }

    if (value !== null && typeof value === "object") {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        obj[k] = deepConvert(v, depth + 1);
      }
      return obj;
    }

    return value;
  }

  /**
   * Process authData (shared between attestationObject and assertion).
   */
  function processAuthData(
    authData: DecodedAuthData
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {
      rpIdHash: bytesToDisplay(authData.rpIdHash),
      flags: formatFlags(authData.flags),
      signCount: authData.signCount,
    };

    if (authData.attestedCredentialData) {
      const acd = authData.attestedCredentialData;
      // Hoist aaguid to authData level for display (per UI-SPEC tree shape)
      result.aaguid = formatAaguid(acd.aaguid);
      result.attestedCredentialData = {
        credentialId: bytesToDisplay(acd.credentialId),
        credentialIdLength: acd.credentialIdLength,
        coseKey: formatCoseKey(acd.coseKey),
      };
    }

    if (authData.extensions) {
      result.extensions = deepConvert(authData.extensions, 0);
    }

    return result;
  }

  /**
   * Process assertion result into tree shape.
   */
  function processAssertion(
    data: DecodedAssertion
  ): Record<string, unknown> {
    const tree: Record<string, unknown> = {
      authenticatorData: processAuthData(data.authenticatorData),
      signature: bytesToDisplay(data.signature),
      clientDataJSON: processClientDataJSON(data.clientDataJSON),
    };

    if (data.userHandle) {
      tree.userHandle = bytesToDisplay(data.userHandle);
    }

    return tree;
  }

  /**
   * Process clientDataJSON into tree shape.
   */
  function processClientDataJSON(
    data: DecodedClientDataJSON
  ): Record<string, unknown> {
    const tree: Record<string, unknown> = {
      type: data.type,
      challenge: data.challenge,
      origin: data.origin,
      rawJSON: data.rawJSON,
    };

    if (data.crossOrigin !== undefined) {
      tree.crossOrigin = data.crossOrigin;
    }

    if (data.extraFields && Object.keys(data.extraFields).length > 0) {
      tree.extraFields = deepConvert(data.extraFields, 0);
    }

    return tree;
  }

  /**
   * Process a full PublicKeyCredential decode result into tree shape.
   */
  function processPublicKeyCredential(
    data: DecodedPublicKeyCredential
  ): Record<string, unknown> {
    const tree: Record<string, unknown> = {
      id: data.id,
      credentialId: bytesToDisplay(data.credentialId),
      type: data.credentialType,
    };

    if (data.authenticatorAttachment !== undefined) {
      tree.authenticatorAttachment = data.authenticatorAttachment;
    }

    if (data.clientExtensionResults !== undefined) {
      tree.clientExtensionResults = deepConvert(data.clientExtensionResults, 0);
    }

    const response: Record<string, unknown> = {};

    if (data.response.transports) {
      response.transports = data.response.transports;
    }

    if (data.response.publicKeyAlgorithm !== undefined) {
      response.publicKeyAlgorithm = `${data.response.publicKeyAlgorithm.raw} (${data.response.publicKeyAlgorithm.name})`;
    }

    if (data.response.publicKey) {
      response.publicKey = bytesToDisplay(data.response.publicKey);
    }

    if (data.response.attestationObject) {
      response.attestationObject = {
        fmt: data.response.attestationObject.fmt,
        authData: processAuthData(data.response.attestationObject.authData),
        attStmt: deepConvert(data.response.attestationObject.attStmt, 0),
      };
    }

    if (data.response.authenticatorData) {
      response.authenticatorData = processAuthData(data.response.authenticatorData);
    }

    if (data.response.clientDataJSON) {
      response.clientDataJSON = processClientDataJSON(data.response.clientDataJSON);
    }

    if (data.response.signature) response.signature = bytesToDisplay(data.response.signature);
    if (data.response.userHandle !== undefined) response.userHandle = data.response.userHandle === null ? null : bytesToDisplay(data.response.userHandle);
    tree.response = response;

    return tree;
  }

  /**
   * Main preprocessing entry point.
   * Transforms a DecodeResult into a display-ready plain object for react-json-view-lite.
   */
  if (!result.ok) {
    return { tree: {} };
  }

  let tree: Record<string, unknown>;

  switch (result.type) {
    case "attestationObject":
      tree = {
        fmt: result.data.fmt,
        authData: processAuthData(result.data.authData),
        attStmt: deepConvert(result.data.attStmt, 0),
      };
      break;
    case "assertion":
      tree = processAssertion(result.data);
      break;
    case "clientDataJSON":
      tree = processClientDataJSON(result.data);
      break;
    case "authenticatorData":
      tree = processAuthData(result.data);
      break;
    case "publicKeyCredential":
      tree = processPublicKeyCredential(result.data);
      break;
    case "raw-cbor":
      tree = (result.data !== null && typeof result.data === "object") ? deepConvert(result.data, 0) as Record<string, unknown> : { value: deepConvert(result.data, 0) };
      break;
  }

  return { tree };
}
