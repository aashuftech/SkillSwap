import { API } from "../lib/apiConfig.js";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, MapPin, Sparkles, Star } from "lucide-react";


export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API}/api/users/${id}/profile`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Profile could not load.");
        setProfile(data);
      })
      .catch((loadError) => setError(loadError.message || "Could not reach the server."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="grid min-h-[50vh] place-items-center">
        <Loader2 className="animate-spin text-purple-500" size={26} />
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error || "Profile not found."}</p>
        <Link to="/explore" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-purple-700">
          <ArrowLeft size={15} /> Back to Browse Skills
        </Link>
      </main>
    );
  }

  const { user, skills } = profile;

  return (
    <main className="min-h-screen bg-[#faf9ff] px-4 py-14 sm:px-7">
      <section className="mx-auto max-w-3xl">
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700">
          <ArrowLeft size={15} /> Back to Browse Skills
        </Link>

        <div className="mt-5 rounded-3xl border border-purple-100 bg-white p-8 shadow-sm flex items-center gap-5">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-200 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-purple-100 text-purple-700 font-bold text-3xl flex items-center justify-center shrink-0 shadow-sm">
              {user.name?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {user.ratingCount > 0 && user.rating ? (
                <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs border border-amber-200">
                  <Star size={13} className="fill-amber-400 text-amber-500" />
                  {Number(user.rating).toFixed(1)} ({user.ratingCount} {user.ratingCount === 1 ? "review" : "reviews"})
                </span>
              ) : null}
              {user.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} /> {user.location}
                </span>
              )}
              {user.department && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  {user.department}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.18em] text-purple-600">
            <Sparkles size={14} /> Approved skills
          </p>
          {skills.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">This member doesn't have any approved skills yet.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {skills.map((skill) => (
                <article key={skill.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                    {skill.category}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-gray-900">{skill.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{skill.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
