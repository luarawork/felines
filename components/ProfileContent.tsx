// Client component for /profile.
// Redirects anonymous visitors to /login, and otherwise renders the
// signed-in user's profile in the same editorial, full-bleed section
// style as the home page: a light header, a colonies grid, a dark
// unified activity timeline, and a knowledge section with progress and
// the personalization quiz.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ARTICLES } from "@/lib/articles";
import { supabase } from "@/lib/supabaseClient";
import { getOpenReportsForMyColonies, getOwnReports, type MyColonyReport, type OwnReport } from "@/lib/myColonyReports";
import { getReportTypeLabel } from "@/lib/reportTypes";
import {
  ensureOwnProfile,
  getAvatarUrl,
  getDisplayName,
  updateOwnAvatarUrl,
  updateOwnDisplayName,
} from "@/lib/profile";
import { buildSafeStoragePath, validatePhotoFile } from "@/lib/storage";
import EmptyState from "@/components/EmptyState";
import PhotoUploadButton from "@/components/PhotoUploadButton";
import Quiz from "@/components/Quiz";
import Reveal from "@/components/Reveal";
import { useEscapeToClose } from "@/lib/useEscapeToClose";

type LinkedColony = { id: string; name: string };
type CreatedColonyRecord = { id: string; name: string; created_at: string };
type CaretakerLinkRecord = { id: string; name: string; createdAt: string };
type FeedingRecord = { id: string; colony_id: string; created_at: string };
type ConfirmationRecord = { confirmedAt: string; reportType: string; reportStatus: string };
type ThankYouRecord = { id: string; colonyName: string; createdAt: string; otherPartyName: string };
type ActivityItem = { id: string; date: string; icon: string; label: string; href?: string };

export default function ProfileContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [feedings, setFeedings] = useState<FeedingRecord[]>([]);
  const [linkedColonies, setLinkedColonies] = useState<LinkedColony[]>([]);
  const [followedColonies, setFollowedColonies] = useState<LinkedColony[]>([]);
  const [createdColonies, setCreatedColonies] = useState<CreatedColonyRecord[]>([]);
  const [caretakerLinks, setCaretakerLinks] = useState<CaretakerLinkRecord[]>([]);
  const [readSlugs, setReadSlugs] = useState<string[]>([]);
  const [myColonyReports, setMyColonyReports] = useState<MyColonyReport[]>([]);
  const [ownReports, setOwnReports] = useState<OwnReport[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSkipped, setQuizSkipped] = useState(false);
  const [confirmationsGiven, setConfirmationsGiven] = useState<ConfirmationRecord[]>([]);
  const [thanksSent, setThanksSent] = useState<ThankYouRecord[]>([]);
  const [thanksReceived, setThanksReceived] = useState<ThankYouRecord[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    async function loadProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.push("/login?returnTo=/profile");
        return;
      }

      setUserId(session.user.id);
      setEmail(session.user.email ?? null);
      setMemberSince(session.user.created_at ?? null);

      await ensureOwnProfile(session.user.id);
      const currentDisplayName = await getDisplayName(session.user.id);
      setDisplayName(currentDisplayName ?? "");
      setAvatarUrl(await getAvatarUrl(session.user.id));

      const { data: streakRow } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak")
        .eq("id", session.user.id)
        .maybeSingle();
      setCurrentStreak(streakRow?.current_streak ?? 0);
      setLongestStreak(streakRow?.longest_streak ?? 0);

      const [{ data: feedingRows }, { data: caretakerRows }, { data: progressRows }, { data: createdColonyRows }] =
        await Promise.all([
          supabase
            .from("feedings")
            .select("id, colony_id, created_at")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("caretakers")
            .select("colonies(id, name), created_at")
            .eq("user_id", session.user.id),
          supabase
            .from("knowledge_progress")
            .select("article_slug")
            .eq("user_id", session.user.id),
          supabase
            .from("colonies")
            .select("id, name, created_at")
            .eq("created_by", session.user.id),
        ]);

      if (feedingRows) setFeedings(feedingRows as FeedingRecord[]);

      if (caretakerRows) {
        const colonies = caretakerRows
          .map((row) => row.colonies as unknown as LinkedColony | null)
          .filter((colony): colony is LinkedColony => colony !== null);
        setLinkedColonies(colonies);

        setCaretakerLinks(
          caretakerRows
            .map((row) => {
              const colony = row.colonies as unknown as LinkedColony | null;
              return colony ? { id: colony.id, name: colony.name, createdAt: row.created_at } : null;
            })
            .filter((row): row is { id: string; name: string; createdAt: string } => row !== null)
        );
      }

      if (createdColonyRows) setCreatedColonies(createdColonyRows as CreatedColonyRecord[]);

      const { data: followerRows } = await supabase
        .from("colony_followers")
        .select("colonies(id, name)")
        .eq("user_id", session.user.id);
      if (followerRows) {
        setFollowedColonies(
          followerRows
            .map((row) => row.colonies as unknown as LinkedColony | null)
            .filter((colony): colony is LinkedColony => colony !== null)
        );
      }

      if (progressRows) {
        setReadSlugs(Array.from(new Set(progressRows.map((row) => row.article_slug))));
      }

      const reports = await getOpenReportsForMyColonies(session.user.id);
      setMyColonyReports(reports);

      setOwnReports(await getOwnReports(session.user.id));

      const [{ data: confirmationRows }, { data: sentRows }, { data: receivedRows }] =
        await Promise.all([
          supabase
            .from("report_confirmations")
            .select("created_at, reports(type, status)")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("thanks")
            .select("id, created_at, colonies(name), caretaker_user_id")
            .eq("sender_user_id", session.user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("thanks")
            .select("id, created_at, colonies(name), sender_user_id")
            .eq("caretaker_user_id", session.user.id)
            .order("created_at", { ascending: false }),
        ]);

      if (confirmationRows) {
        setConfirmationsGiven(
          confirmationRows
            .map((row) => {
              const report = row.reports as unknown as { type: string; status: string } | null;
              return report
                ? { confirmedAt: row.created_at, reportType: report.type, reportStatus: report.status }
                : null;
            })
            .filter((row): row is ConfirmationRecord => row !== null)
        );
      }

      // Both thanks queries need the other party's display name, which
      // requires a separate profiles lookup since `thanks` only stores
      // auth.users ids (profiles can't be embedded directly via PostgREST).
      const otherPartyIds = new Set<string>();
      (sentRows ?? []).forEach((row) => otherPartyIds.add(row.caretaker_user_id as string));
      (receivedRows ?? []).forEach((row) => otherPartyIds.add(row.sender_user_id as string));

      const { data: otherProfiles } =
        otherPartyIds.size > 0
          ? await supabase.from("profiles").select("id, display_name").in("id", Array.from(otherPartyIds))
          : { data: [] };

      function displayNameFor(id: string) {
        return (otherProfiles ?? []).find((profile) => profile.id === id)?.display_name || "alguém da comunidade";
      }

      if (sentRows) {
        setThanksSent(
          sentRows.map((row) => ({
            id: row.id,
            colonyName: (row.colonies as unknown as { name: string } | null)?.name ?? "Colônia",
            createdAt: row.created_at,
            otherPartyName: displayNameFor(row.caretaker_user_id as string),
          }))
        );
      }

      if (receivedRows) {
        setThanksReceived(
          receivedRows.map((row) => ({
            id: row.id,
            colonyName: (row.colonies as unknown as { name: string } | null)?.name ?? "Colônia",
            createdAt: row.created_at,
            otherPartyName: displayNameFor(row.sender_user_id as string),
          }))
        );
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSaveDisplayName() {
    if (!userId) return;
    setSavingName(true);
    const success = await updateOwnDisplayName(userId, displayName);
    setSavingName(false);
    if (success) setEditingName(false);
  }

  async function handleAvatarChange(file: File | null) {
    if (!file || !userId) return;
    setAvatarError(null);

    const photoError = validatePhotoFile(file);
    if (photoError) {
      setAvatarError(photoError);
      return;
    }

    setUploadingAvatar(true);
    const filePath = buildSafeStoragePath(`avatars/${userId}`, file);
    const { error: uploadError } = await supabase.storage.from("colony-photos").upload(filePath, file);

    if (uploadError) {
      setUploadingAvatar(false);
      setAvatarError("A foto não subiu. Tenta de novo?");
      return;
    }

    const publicUrl = supabase.storage.from("colony-photos").getPublicUrl(filePath).data.publicUrl;
    const success = await updateOwnAvatarUrl(userId, publicUrl);
    setUploadingAvatar(false);

    if (!success) {
      setAvatarError("A foto não foi salva. Tenta de novo?");
      return;
    }

    setAvatarUrl(publicUrl);
  }

  useEscapeToClose(showQuiz, () => setShowQuiz(false));

  if (loading) return null;

  const readCount = readSlugs.length;
  const progressPercent = Math.round((readCount / ARTICLES.length) * 100);
  const hasNoContributionsYet =
    feedings.length === 0 &&
    linkedColonies.length === 0 &&
    myColonyReports.length === 0 &&
    ownReports.length === 0 &&
    readCount === 0;

  // One combined, chronological feed instead of seven separate lists —
  // feedings, reports, confirmations, thanks, colony creation and
  // becoming a caretaker are all "things you did," so they read more
  // like a life story when merged together.
  const activity: ActivityItem[] = [
    ...createdColonies.map((colony) => ({
      id: `colony-created-${colony.id}`,
      date: colony.created_at,
      icon: "🐾",
      label: `Colônia cadastrada: ${colony.name}`,
      href: `/colony/${colony.id}`,
    })),
    ...caretakerLinks.map((link) => ({
      id: `caretaker-${link.id}`,
      date: link.createdAt,
      icon: "🤝",
      label: `Passou a cuidar de ${link.name}`,
      href: `/colony/${link.id}`,
    })),
    ...feedings.map((feeding) => ({
      id: `feed-${feeding.id}`,
      date: feeding.created_at,
      icon: "🍽️",
      label: "Alimentação registrada",
      href: `/colony/${feeding.colony_id}`,
    })),
    ...ownReports.map((report) => ({
      id: `report-${report.id}`,
      date: report.created_at,
      icon: "🚨",
      label: `Relato enviado: ${getReportTypeLabel(report.type)}`,
      href: report.colony_id ? `/colony/${report.colony_id}` : undefined,
    })),
    ...confirmationsGiven.map((confirmation, index) => ({
      id: `confirm-${index}-${confirmation.confirmedAt}`,
      date: confirmation.confirmedAt,
      icon: "✅",
      label: `Confirmou: ${getReportTypeLabel(confirmation.reportType)}`,
    })),
    ...thanksSent.map((thanks) => ({
      id: `thanks-sent-${thanks.id}`,
      date: thanks.createdAt,
      icon: "🙏",
      label: `Você agradeceu ${thanks.otherPartyName} (${thanks.colonyName})`,
    })),
    ...thanksReceived.map((thanks) => ({
      id: `thanks-received-${thanks.id}`,
      date: thanks.createdAt,
      icon: "🙏",
      label: `${thanks.otherPartyName} te agradeceu (${thanks.colonyName})`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const colonyOpenReportCounts = new Map<string, number>();
  myColonyReports.forEach((report) => {
    colonyOpenReportCounts.set(report.colony_id, (colonyOpenReportCounts.get(report.colony_id) ?? 0) + 1);
  });

  return (
    <div>
      {/* Header */}
      <section className="bg-felines-background py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-center gap-5">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Sua foto de perfil"
                  className="h-20 w-20 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.10)]"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-felines-border" />
              )}

              <div>
                {editingName ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      aria-label="Nome de exibição"
                      value={displayName}
                      onChange={(formEvent) => setDisplayName(formEvent.target.value)}
                      maxLength={60}
                      placeholder="Como você quer ser chamado"
                      autoFocus
                      className="rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
                    />
                    <button
                      onClick={handleSaveDisplayName}
                      disabled={savingName}
                      className="rounded-full bg-felines-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
                    >
                      {savingName ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold leading-tight text-felines-text-primary sm:text-[40px]">
                    {displayName || "Sem nome de exibição"}{" "}
                    <button
                      onClick={() => setEditingName(true)}
                      className="ml-1 text-sm font-medium text-felines-accent-hover align-middle"
                    >
                      Editar
                    </button>
                  </h1>
                )}
                {memberSince && (
                  <p className="mt-1 text-xs uppercase tracking-[0.1em] text-felines-text-secondary">
                    Membro desde{" "}
                    {new Date(memberSince).toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
                <p className="mt-1 text-sm text-felines-text-secondary">
                  {email} ·{" "}
                  {userId && (
                    <Link href={`/u/${userId}`} className="text-felines-accent-hover">
                      ver página pública
                    </Link>
                  )}
                </p>
                <div className="mt-2">
                  <PhotoUploadButton
                    label="Trocar foto"
                    file={null}
                    onChange={(file) => handleAvatarChange(file)}
                  />
                  {uploadingAvatar && (
                    <p className="mt-1 text-xs text-felines-text-secondary">Enviando...</p>
                  )}
                  {avatarError && <p className="mt-1 text-xs text-felines-emergency">{avatarError}</p>}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Personal motivation, not competition — never shown on the
              public profile (/u/:id) or anywhere else visible to
              other people. */}
          <Reveal delayMs={60}>
            <div className="mt-6 inline-flex flex-wrap items-center gap-4 rounded-xl border border-felines-border bg-felines-surface px-4 py-3">
              {currentStreak > 1 ? (
                <p className="text-sm font-semibold text-felines-accent">
                  🔥 {currentStreak} {currentStreak === 1 ? "dia" : "dias"} de sequência
                </p>
              ) : (
                <p className="text-sm text-felines-text-secondary">Comece sua sequência hoje</p>
              )}
              {longestStreak > 1 && (
                <p className="text-xs text-felines-text-secondary">
                  Melhor sequência: {longestStreak} {longestStreak === 1 ? "dia" : "dias"}
                </p>
              )}
            </div>
          </Reveal>

          {hasNoContributionsYet && (
            <div className="mt-10">
              <EmptyState
                main="Sua jornada começa aqui."
                sub="Cada colônia que você visita, cada relato que você faz — tudo fica registrado aqui."
                ctas={[{ label: "Explorar o mapa →", href: "/map" }]}
              />
            </div>
          )}
        </div>
      </section>

      {/* Linked colonies */}
      <section className="bg-felines-surface py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
              Suas colônias
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              As colônias que você cuida
            </h2>
          </Reveal>

          {linkedColonies.length === 0 ? (
            <p className="mt-6 text-sm text-felines-text-secondary">
              Você ainda não cuida de nenhuma colônia.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {linkedColonies.map((colony, index) => {
                const openCount = colonyOpenReportCounts.get(colony.id) ?? 0;
                return (
                  <Reveal key={colony.id} delayMs={index * 80}>
                    <Link
                      href={`/colony/${colony.id}`}
                      className="block h-full rounded-2xl border border-felines-border bg-felines-background p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
                    >
                      <p className="font-semibold text-felines-text-primary">{colony.name}</p>
                      {openCount > 0 ? (
                        <p className="mt-2 inline-block rounded-full bg-felines-warning-light px-2 py-0.5 text-xs font-medium text-felines-warning">
                          {openCount} {openCount === 1 ? "relato aberto" : "relatos abertos"}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-felines-text-secondary">Sem relatos abertos</p>
                      )}
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Followed colonies — same card style as linked colonies, with a
          "Seguindo" badge instead of a caretaker-specific stat. */}
      {followedColonies.length > 0 && (
        <section className="bg-felines-background py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
                Acompanhando
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
                Colônias que você segue
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {followedColonies.map((colony, index) => (
                <Reveal key={colony.id} delayMs={index * 80}>
                  <Link
                    href={`/colony/${colony.id}`}
                    className="block h-full rounded-2xl border border-felines-border bg-felines-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
                  >
                    <p className="font-semibold text-felines-text-primary">{colony.name}</p>
                    <p className="mt-2 inline-block rounded-full bg-felines-accent-light px-2 py-0.5 text-xs font-medium text-felines-accent-hover">
                      Seguindo
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Knowledge — progress, article badges, quiz */}
      <section className="bg-felines-background py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
              Conhecimento
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              Progresso no guia
            </h2>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="mt-6 h-3 w-full max-w-xl rounded-full bg-felines-border">
              <div
                className="h-3 rounded-full bg-felines-success transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-felines-text-secondary">
              {readCount} de {ARTICLES.length} artigos lidos
            </p>
          </Reveal>

          <div className="mt-6 flex flex-wrap gap-2">
            {ARTICLES.map((article) => {
              const isRead = readSlugs.includes(article.slug);
              return (
                <Link
                  key={article.slug}
                  href={`/learn/${article.slug}`}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-transform duration-150 hover:-translate-y-0.5 ${
                    isRead
                      ? "bg-felines-accent text-white"
                      : "border-2 border-felines-border text-felines-text-secondary"
                  }`}
                >
                  {article.title}
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* Quiz — its own section, separate from the article progress above */}
      {readCount >= 3 && (
        <section className="bg-felines-dark py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-text-secondary-on-dark">
                Descubra seu perfil
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
                Que tipo de vizinho você é?
              </h2>
            </Reveal>

            {!showQuiz && !quizSkipped && (
              <Reveal delayMs={100}>
                <div className="mt-6 max-w-2xl rounded-2xl bg-gradient-to-br from-felines-accent to-felines-accent-hover p-8 shadow-[0_8px_24px_rgba(196,112,79,0.35)]">
                  <span className="text-4xl" aria-hidden="true">
                    🐾
                  </span>
                  <p className="mt-3 text-2xl font-bold leading-tight text-white">
                    Descubra em 3 perguntas rápidas
                  </p>
                  <p className="mt-1 text-sm text-white/80">Não existe resposta errada.</p>
                  <div className="mt-5 flex items-center gap-4">
                    <button
                      onClick={() => setShowQuiz(true)}
                      className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-felines-accent-hover transition-transform duration-150 hover:-translate-y-0.5"
                    >
                      Descobrir
                    </button>
                    <button
                      onClick={() => setQuizSkipped(true)}
                      className="text-sm text-white/80 hover:text-white"
                    >
                      Fazer isso depois
                    </button>
                  </div>
                </div>
              </Reveal>
            )}

            {quizSkipped && !showQuiz && (
              <p className="mt-6 text-sm text-felines-text-secondary-on-dark">
                Sem problema. Você pode fazer o quiz quando quiser.
              </p>
            )}

            {showQuiz && (
              <div
                className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
                onClick={() => setShowQuiz(false)}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Quiz: que tipo de vizinho você é?"
                  className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-felines-background p-2 shadow-xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Quiz
                    onSkip={() => {
                      setShowQuiz(false);
                      setQuizSkipped(true);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Unified activity timeline — dark section, last on the page */}
      <section className="bg-felines-dark py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-text-secondary-on-dark">
              Sua jornada
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
              O que você já fez
            </h2>
          </Reveal>

          {activity.length === 0 ? (
            <p className="mt-6 text-sm text-felines-text-secondary-on-dark">
              Ainda não tem nada registrado por aqui. Toda alimentação, relato ou agradecimento vai aparecer aqui.
            </p>
          ) : (
            <ol className="mt-8 max-w-3xl space-y-4 border-l-2 border-felines-accent pl-5">
              {activity.map((item, index) => (
                <Reveal key={item.id} delayMs={Math.min(index, 8) * 60}>
                  <li>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="block rounded-xl border border-felines-border-on-dark bg-felines-dark-accent p-4 transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <span className="text-sm text-white">
                          {item.icon} {item.label}
                        </span>
                        <p className="mt-1 text-xs text-felines-text-secondary-on-dark">
                          {new Date(item.date).toLocaleDateString("pt-BR")}
                        </p>
                      </Link>
                    ) : (
                      <div className="rounded-xl border border-felines-border-on-dark bg-felines-dark-accent p-4">
                        <span className="text-sm text-white">
                          {item.icon} {item.label}
                        </span>
                        <p className="mt-1 text-xs text-felines-text-secondary-on-dark">
                          {new Date(item.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}
                  </li>
                </Reveal>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
