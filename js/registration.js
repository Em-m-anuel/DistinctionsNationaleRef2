/* Frontend-only boundary for registration and OTP.
   No registration endpoint or OTP contract exists in this static project.
   A real application may supply window.DN_REGISTRATION_ADAPTER BEFORE this file:
   { start({profile, fields}): Promise<{ok:true,requestId:string,otpLength?:number}|{ok:false,message:string}>,
     verify({profile,requestId,code}): Promise<{ok:true}|{ok:false,message:string}>,
     resend({profile,requestId}): Promise<{ok:true}|{ok:false,message:string}> }.
   Never simulate delivery, verification, activation, or a server success. */
const registrationAdapter = window.DN_REGISTRATION_ADAPTER || null;
const registrationAvailable = Boolean(registrationAdapter &&
  typeof registrationAdapter.start === 'function' &&
  typeof registrationAdapter.verify === 'function' &&
  typeof registrationAdapter.resend === 'function');

async function registrationOperation(operation, data) {
  if (!registrationAvailable) return {
    ok: false, unavailable: true,
    message: "Le service d'inscription et de vérification n'est pas encore connecté. Aucun code n'a été envoyé."
  };
  try {
    const result = await registrationAdapter[operation](data);
    if (result && result.ok === true && (operation !== 'start' || typeof result.requestId === 'string' && result.requestId)) {
      return result;
    }
    return { ok: false, message: typeof result?.message === 'string' ? result.message : "Une erreur est survenue. Veuillez réessayer." };
  } catch {
    return { ok: false, message: "Le service est indisponible. Veuillez réessayer ultérieurement." };
  }
}
