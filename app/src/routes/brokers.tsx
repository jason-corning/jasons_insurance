import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Page, PageHeading, Spinner } from "../components/site";
import { api } from "../lib/client-api";

type Broker = {
  id: number;
  name: string;
  agency: string;
  licenseNo: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  languages: string[];
  specialties: string[];
};

export const Route = createFileRoute("/brokers")({
  component: Brokers,
});

function Brokers() {
  const [q, setQ] = useState("");
  const [zip, setZip] = useState("");
  const [specialty, setSpecialty] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["brokers", q, zip, specialty],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (zip) params.set("zip", zip);
      if (specialty) params.set("specialty", specialty);
      return api<{ ok: boolean; brokers: Broker[] }>(`/api/brokers?${params.toString()}`);
    },
  });

  return (
    <Page>
      <PageHeading
        eyebrow="Get help"
        title="Find a licensed broker"
        lede="Brokers help you choose and manage coverage at no cost to you; they're paid by carriers, and your premium is the same either way."
      />
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-sage/50 bg-paper p-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, agency, city, or language"
            className="w-full max-w-xs rounded-full border border-sage/70 bg-ivory px-4 py-2 text-sm text-ink outline-none focus:border-pine"
            aria-label="Search brokers"
          />
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="ZIP code"
            inputMode="numeric"
            maxLength={5}
            className="w-28 rounded-full border border-sage/70 bg-ivory px-4 py-2 text-sm text-ink outline-none focus:border-pine"
            aria-label="Filter by ZIP code"
          />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="rounded-full border border-sage/70 bg-ivory px-4 py-2 text-sm font-medium text-ink"
            aria-label="Filter by specialty"
          >
            <option value="">Health & dental</option>
            <option value="health">Health specialists</option>
            <option value="dental">Dental specialists</option>
          </select>
        </div>

        {isLoading ? (
          <Spinner />
        ) : !data || data.brokers.length === 0 ? (
          <p className="py-16 text-center text-ink/60">
            No brokers match that search. Try fewer filters, or a nearby ZIP code.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.brokers.map((broker) => (
              <div key={broker.id} className="rounded-3xl border border-sage/60 bg-ivory p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-pine font-display text-lg font-semibold text-ivory">
                    {broker.name.charAt(0)}
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold leading-tight text-ink">{broker.name}</h2>
                    <p className="text-sm text-ink/60">{broker.agency}</p>
                  </div>
                </div>
                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink/50">License</dt>
                    <dd className="font-medium text-ink">{broker.licenseNo}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink/50">Location</dt>
                    <dd className="font-medium text-ink">
                      {broker.city}, {broker.state} {broker.zip}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink/50">Languages</dt>
                    <dd className="font-medium text-ink">{broker.languages.join(", ")}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {broker.specialties.map((s) => (
                    <span key={s} className="rounded-full bg-sagesoft px-3 py-1 text-xs font-semibold capitalize text-pine">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-2 border-t border-sage/40 pt-4 text-sm">
                  <a href={`tel:${broker.phone.replace(/\D/g, "")}`} className="rounded-full border-2 border-pine/20 px-4 py-2 font-semibold text-pine transition hover:border-pine hover:bg-sagesoft">
                    {broker.phone}
                  </a>
                  <a href={`mailto:${broker.email}`} className="rounded-full border-2 border-pine/20 px-4 py-2 font-semibold text-pine transition hover:border-pine hover:bg-sagesoft">
                    Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
