/**
 * 🟢 Lógica de Código Maestro de Bypass para OTP (Modo Beta)
 */
export function isBypassOtpEnabled(): boolean {
  return process.env.BYPASS_OTP_ENABLED === "true";
}

export function validateMasterOtp(codigo: string): boolean {
  const masterCode = process.env.OTP_MASTER_CODE || "1234";
  return isBypassOtpEnabled() && codigo.trim() === masterCode;
}