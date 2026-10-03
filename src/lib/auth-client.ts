/**
 * Cliente de login usado pelas telas (roda no navegador).
 * Exemplos: authClient.signIn.email({ email, password }), authClient.signOut(),
 * authClient.useSession().
 */
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
