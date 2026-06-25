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
import { getOpenReportsForMyColonies, type MyColonyReport } from "@/lib/myColonyReports";
import { getReportTypeLabel } from "@/lib/reportTypes";
import { ensureOwnProfile, getDisplayName, updateOwnDisplayName } from "@/lib/profile";

type LinkedColony = { id: string; name: string };
type FeedingRecord = { id: string; colony_id: string; created_at: string };

export default function ProfileContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [feedings, setFeedings] = useState<FeedingRecord[]>([]);
  const [linkedColonies, setLinkedColonies] = useState<LinkedColony[]>([]);
  const [readCount, setReadCount] = useState(0);
  const [myColonyReports, setMyColonyReports] = useState<MyColonyReport[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.push("/login");
        return;
      }

      setUserId(session.user.id);
      setEmail(session.user.email ?? null);

      await ensureOwnProfile(session.user.id);
      const currentDisplayName = await getDisplayName(session.user.id);
      setDisplayName(currentDisplayName ?? "");

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

  if (loading) return null;

  const progressPercent = Math.round((readCount / ARTICLES.length) * 100);

  return (
    <div className="mt-6 space-y-8">
      <p className="text-sm text-felines-text-secondary">Conectado como {email}</p>

      <section>
        <h2 className="text-lg font-bold text-felines-text-primary">Nome de exibição</h2>
        <p className="mt-1 text-sm text-felines-text-secondary">
          Mostrado na sua{" "}
          {userId ? (
            <Link href={`/u/${userId}`} className="text-felines-accent">
              página pública de cuidador
            </Link>
          ) : (
            "página pública de cuidador"
          )}{" "}
          — seu e-mail nunca é exibido publicamente.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
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
