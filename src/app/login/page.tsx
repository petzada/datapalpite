"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
    const [mode, setMode] = useState<"login" | "signup">(initialMode);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Update mode when URL changes
    useEffect(() => {
        const urlMode = searchParams.get("mode");
        if (urlMode === "signup") {
            setMode("signup");
        } else {
            setMode("login");
        }
        // Clear messages when mode changes
        setError(null);
        setSuccessMessage(null);
    }, [searchParams]);

    // Form states for signup
    const [signupData, setSignupData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        referralCode: "",
    });

    // Form states for login
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const handleGoogleLogin = async () => {
        const supabase = createClient()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })

        if (error) {
            console.error('Erro no login:', error.message)
            setError('Erro ao fazer login com Google. Tente novamente.')
            setLoading(false)
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) {
            setError("Você precisa concordar com os termos para continuar.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const supabase = createClient();

        // Validar senha
        if (signupData.password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres.");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: signupData.email,
            password: signupData.password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    full_name: `${signupData.firstName} ${signupData.lastName}`.trim(),
                    referral_code: signupData.referralCode || null,
                }
            }
        });

        if (error) {
            console.error('Erro no cadastro:', error.message);
            if (error.message.includes('already registered')) {
                setError('Este e-mail já está cadastrado. Tente fazer login.');
            } else {
                setError(error.message || 'Erro ao criar conta. Tente novamente.');
            }
            setLoading(false);
            return;
        }

        // Verificar se precisa confirmar e-mail
        if (data.user && !data.session) {
            setSuccessMessage('Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.');
            setSignupData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                referralCode: "",
            });
        } else if (data.session) {
            // Login automático (confirmação de e-mail desabilitada)
            router.push('/dashboard');
        }

        setLoading(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) {
            setError("Você precisa concordar com os termos para continuar.");
            return;
        }

        setLoading(true);
        setError(null);

        const supabase = createClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginData.email,
            password: loginData.password,
        });

        if (error) {
            console.error('Erro no login:', error.message);
            if (error.message.includes('Invalid login credentials')) {
                setError('E-mail ou senha incorretos.');
            } else if (error.message.includes('Email not confirmed')) {
                setError('E-mail não confirmado. Verifique sua caixa de entrada.');
            } else {
                setError(error.message || 'Erro ao fazer login. Tente novamente.');
            }
            setLoading(false);
            return;
        }

        if (data.session) {
            router.push('/dashboard');
        }

        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto w-full">
            {/* Logo - Centered */}
            <Link href="/" className="text-2xl font-bold text-primary mb-12 block text-center">
                Data Palpite
            </Link>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm">
                    {successMessage}
                </div>
            )}

            {/* Google OAuth Button */}
            <Button
                variant="outline"
                className="w-full h-12 mb-6 gap-3 rounded-full"
                onClick={handleGoogleLogin}
                disabled={loading}
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                Continuar com Google
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
            </div>

            {/* Mode Switch - with visible border on non-selected */}
            <div className="flex bg-muted p-1 rounded-full mb-8">
                <button
                    className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${mode === "signup"
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground border border-muted-foreground/30"
                        }`}
                    onClick={() => setMode("signup")}
                >
                    Criar conta
                </button>
                <button
                    className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${mode === "login"
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground border border-muted-foreground/30"
                        }`}
                    onClick={() => setMode("login")}
                >
                    Login
                </button>
            </div>

            {/* Signup Form */}
            {mode === "signup" && (
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nome</Label>
                            <Input
                                id="firstName"
                                placeholder="João"
                                value={signupData.firstName}
                                onChange={(e) =>
                                    setSignupData({ ...signupData, firstName: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Sobrenome</Label>
                            <Input
                                id="lastName"
                                placeholder="Silva"
                                value={signupData.lastName}
                                onChange={(e) =>
                                    setSignupData({ ...signupData, lastName: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="joao@email.com"
                            value={signupData.email}
                            onChange={(e) =>
                                setSignupData({ ...signupData, email: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={signupData.password}
                            onChange={(e) =>
                                setSignupData({ ...signupData, password: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="referralCode">
                            Código de indicação{" "}
                            <span className="text-muted-foreground">(opcional)</span>
                        </Label>
                        <Input
                            id="referralCode"
                            placeholder="CODIGO123"
                            value={signupData.referralCode}
                            onChange={(e) =>
                                setSignupData({
                                    ...signupData,
                                    referralCode: e.target.value.toUpperCase(),
                                })
                            }
                        />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3 pt-2">
                        <Checkbox
                            id="terms-signup"
                            checked={agreedToTerms}
                            onCheckedChange={(checked) =>
                                setAgreedToTerms(checked as boolean)
                            }
                        />
                        <label
                            htmlFor="terms-signup"
                            className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                        >
                            Li e concordo com os{" "}
                            <Link href="/termos" className="text-primary hover:underline">
                                Termos de Serviços
                            </Link>{" "}
                            e{" "}
                            <Link href="/privacidade" className="text-primary hover:underline">
                                Política de Privacidade
                            </Link>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-full mt-6"
                        disabled={!agreedToTerms || loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando conta...
                            </>
                        ) : (
                            "Criar conta"
                        )}
                    </Button>
                </form>
            )}

            {/* Login Form */}
            {mode === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="login-email">E-mail</Label>
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="joao@email.com"
                            value={loginData.email}
                            onChange={(e) =>
                                setLoginData({ ...loginData, email: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="login-password">Senha</Label>
                        <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginData.password}
                            onChange={(e) =>
                                setLoginData({ ...loginData, password: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3 pt-2">
                        <Checkbox
                            id="terms-login"
                            checked={agreedToTerms}
                            onCheckedChange={(checked) =>
                                setAgreedToTerms(checked as boolean)
                            }
                        />
                        <label
                            htmlFor="terms-login"
                            className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                        >
                            Li e concordo com os{" "}
                            <Link href="/termos" className="text-primary hover:underline">
                                Termos de Serviços
                            </Link>{" "}
                            e{" "}
                            <Link href="/privacidade" className="text-primary hover:underline">
                                Política de Privacidade
                            </Link>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-full mt-6"
                        disabled={!agreedToTerms || loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            "Entrar"
                        )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        <Link href="/recuperar-senha" className="text-primary hover:underline">
                            Esqueceu sua senha?
                        </Link>
                    </p>
                </form>
            )}

            {/* Back to home */}
            <p className="text-center text-sm text-muted-foreground mt-8">
                <Link href="/" className="hover:text-foreground transition-colors">
                    ← Voltar para o início
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-background">
                <Suspense fallback={<div className="max-w-md mx-auto w-full animate-pulse">Carregando...</div>}>
                    <LoginForm />
                </Suspense>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative bg-primary">
                <Image
                    src="/images/login-bg.png"
                    alt="Jogador de futebol"
                    fill
                    className="object-cover opacity-40"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
            </div>
        </div>
    );
}
