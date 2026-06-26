// Client component for the /profile page.
// Redirects anonymous visitors to /login, and otherwise loads the
// signed-in user's feedings (contribution history), linked colonies
// (via caretakers), and knowledge progress.
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

type LinkedColony = { id: string; name: string };
type FeedingRecord = { id: string; colony_id: string; created_at: string };
type ConfirmationRecord = { confirmedAt: string; reportType: string; reportStatus: string };
type ThankYouRecord = { id: string; colonyName: string; createdAt: string; otherPartyName: string };

export default function ProfileContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [feedings, setFeedings] = useState<FeedingRecord[]>([]);
  const [linkedColonies, setLinkedColonies] = useState<LinkedColony[]>([]);
  const [readCount, setReadCount] = useState(0);
  const [myColonyReports, setMyColonyReports] = useState<MyColonyReport[]>([]);
  const [ownReports, setOwnReports] = useState<OwnReport[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [confirmationsGiven, setConfirmationsGiven] = useState<ConfirmationRecord[]>([]);
  const [thanksSent, setThanksSent] = useState<ThankYouRecord[]>([]);
  const [thanksReceived, setThanksReceived] = useState<ThankYouRecord[]>([]);

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

      await ensureOwnProfile(session.user.id);
      const currentDisplayName = await getDisplayName(session.user.id);
      setDisplayName(currentDisplayName ?? "");
      setAvatarUrl(await getAvatarUrl(session.user.id));

      const [{ data: feedingRows }, { data: caretakerRows }, { data: progressRows }] =
        await Promise.all([
          supabase
            .from("feedings")
            .select("id, colony_id, created_at")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("caretakers")
            .select("colonies(id, name)")
            .eq("user_id", session.user.id),
          supabase
            .from("knowledge_progress")
            .select("article_slug")
            .eq("user_id", session.user.id),
        ]);

      if (feedingRows) setFeedings(feedingRows as FeedingRecord[]);

      if (caretakerRows) {
        const colonies = caretakerRows
          .map((row) => row.colonies as unknown as LinkedColony | null)
          .filter((colony): colony is LinkedColony => colony !== null);
        setLinkedColonies(colonies);
      }

      if (progressRows) {
        setReadCount(new Set(progressRows.map((row) => row.article_slug)).size);
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
    setNameSaved(success);
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
      setAvatarError("Não foi possível enviar a foto.");
      return;
    }

    const publicUrl = supabase.storage.from("colony-photos").getPublicUrl(filePath).data.publicUrl;
    const success = await updateOwnAvatarUrl(userId, publicUrl);
    setUploadingAvatar(false);

    if (!success) {
      setAvatarError("Não foi possível salvar a foto.");
      return;
    }

    setAvatarUrl(publicUrl);
  }

  if (loading) return null;

  const progressPercent = Math.round((readCount / ARTICLES.length) * 100);
  const hasNoContributionsYet =
    feedings.length === 0 &&
    linkedColonies.length === 0 &&
    myColonyReports.length === 0 &&
    ownReports.length === 0 &&
    readCount === 0;

  return (
    <div className="mt-6 space-y-8">
      <p className="text-sm text-felines-text-secondary">Conectado como {email}</p>

      {hasNoContributionsYet && (
        <EmptyState
          main="Sua jornada começa aqui."
          sub="Cada colônia que você visita, cada relato que você faz — tudo fica registrado aqui."
          ctas={[{ label: "Explorar o mapa →", href: "/map" }]}
        />
      )}

      <section>
        <h2 className="text-lg font-bold text-felines-text-primary">Foto e nome de exibição</h2>
        <p className="mt-1 text-sm text-felines-text-secondary">
          Mostrados na sua{" "}
          {userId ? (
            <Link href={`/u/${userId}`} className="text-felines-accent">
              página pública de cuidador
            </Link>
          ) : (
            "página pública de cuidador"
          )}{" "}
          — seu e-mail nunca é exibido publicamente.
        </p>

        <div className="mt-3 flex items-center gap-3">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Sua foto de perfil" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-felines-border" />
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(formEvent) => handleAvatarChange(formEvent.target.files?.[0] ?? null)}
              className="block text-sm text-felines-text-secondary"
            />
            {uploadingAvatar && <p className="text-xs text-felines-text-secondary">Enviando...</p>}
            {avatarError && <p className="text-xs text-felines-emergency">{avatarError}</p>}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={displayName}
            onChange={(formEvent) => {
              setDisplayName(formEvent.target.value);
              setNameSaved(false);
            }}
            maxLength={60}
            placeholder="Como você quer ser chamado"
            className="rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />
          <button
            onClick={handleSaveDisplayName}
            disabled={savingName}
            className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
          >
            {savingName ? "Salvando..." : nameSaved ? "Salvo" : "Salvar"}
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-felines-text-primary">
          Relatos das suas colônias
        </h2>
        {myColonyReports.length === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">
            Nenhum relato aberto nas colônias que você criou ou cuida.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {myColonyReports.map((report) => (
              <li
                key={report.id}
                className="rounded-md border border-felines-border px-3 py-2 text-sm"
              >
                <p className="font-medium text-felines-text-primary">
                  {getReportTypeLabel(report.type)} ·{" "}
                  <Link href={`/colony/${report.colony_id}`} className="text-felines-accent">
                    {report.colony_name}
                  </Link>
                </p>
                {report.description && (
                  <p className="text-felines-text-secondary">{report.description}</p>
                )}
                <p className="text-xs text-felines-text-secondary">
                  {new Date(report.created_at).toLocaleDateString("pt-BR")} ·{" "}
                  <Link href="/reports" className="text-felines-accent">
                    confirmar ou resolver
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-felines-text-primary">Relatos enviados</h2>
        {ownReports.length === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">
            Você ainda não enviou nenhum relato.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {ownReports.map((report) => (
              <li
                key={report.id}
                className="rounded-md border border-felines-border px-3 py-2 text-sm"
              >
                <p className="font-medium text-felines-text-primary">
                  {getReportTypeLabel(report.type)} ·{" "}
                  {report.colony_id ? (
                    <Link href={`/colony/${report.colony_id}`} className="text-felines-accent">
                      {report.colony_name}
                    </Link>
                  ) : (
                    <span className="text-felines-text-secondary">Avistamento geral</span>
                  )}
                </p>
                <p className="text-xs text-felines-text-secondary">
                  {report.status === "resolved" ? "resolvido" : "aberto"} ·{" "}
                  {new Date(report.created_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-felines-text-primary">Colônias vinculadas</h2>
        {linkedColonies.length === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">
            Você ainda não é cuidador de nenhuma colônia.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {linkedColonies.map((colony) => (
              <li key={colony.id}>
                <Link
                  href={`/colony/${colony.id}`}
                  className="text-sm font-medium text-felines-accent"
                >
                  {colony.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-felines-text-primary">Histórico de contribuições</h2>
        {feedings.length === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">
            Você ainda não registrou nenhuma alimentação.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {feedings.map((feeding) => (
              <li key={feeding.id} className="text-sm text-felines-text-secondary">
                Alimentação registrada em{" "}
                {new Date(feeding.created_at).toLocaleDateString("pt-BR")}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-felines-text-primary">Confirmações dadas</h2>
        {confirmationsGiven.length === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">
            Você ainda não confirmou nenhum relato.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {confirmationsGiven.map((confirmation) => (
              <li
                key={confirmation.confirmedAt + confirmation.reportType}
                className="flex items-center justify-between rounded-md border border-felines-border px-3 py-2 text-sm"
              >
                <span className="text-felines-text-primary">
                  {getReportTypeLabel(confirmation.reportType)}
                </span>
                <span className="text-xs text-felines-text-secondary">
                  {confirmation.reportStatus === "resolved" ? "resolvido" : "aberto"} ·{" "}
                  {new Date(confirmation.confirmedAt).toLocaleDateString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-felines-text-primary">Agradecimentos</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-felines-text-secondary">Enviados</p>
            {thanksSent.length === 0 ? (
              <p className="mt-1 text-sm text-felines-text-secondary">
                Você ainda não agradeceu nenhum cuidador.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {thanksSent.map((thanks) => (
                  <li key={thanks.id} className="text-sm text-felines-text-secondary">
                    Você agradeceu {thanks.otherPartyName} ({thanks.colonyName}) em{" "}
                    {new Date(thanks.createdAt).toLocaleDateString("pt-BR")}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-felines-text-secondary">Recebidos</p>
            {thanksReceived.length === 0 ? (
              <p className="mt-1 text-sm text-felines-text-secondary">
                Você ainda não recebeu nenhum agradecimento.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {thanksReceived.map((thanks) => (
                  <li key={thanks.id} className="text-sm text-felines-text-secondary">
                    {thanks.otherPartyName} te agradeceu ({thanks.colonyName}) em{" "}
                    {new Date(thanks.createdAt).toLocaleDateString("pt-BR")}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-felines-text-primary">Progresso no guia</h2>
        <div className="mt-3 h-2 w-full rounded-full bg-felines-border">
          <div
            className="h-2 rounded-full bg-felines-success transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-1 text-sm text-felines-text-secondary">
          {readCount} de {ARTICLES.length} artigos lidos
        </p>
      </section>
    </div>
  );
}
