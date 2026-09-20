"use client";

import {
  FACCOES,
  OCUPACOES_SUGERIDAS,
  ORIGENS_SUGERIDAS,
  RELACOES_FACCAO_SUGERIDAS,
  TRILHAS_REDENCAO,
} from "@/lib/character-creation/sacramento/story-data";
import {
  ELEMENTOS_VAZIOS,
  type ElementosHistoria,
  type SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";
const HELPER = "font-crimson text-xs italic text-arcana-text-dim";

export default function Step4Elementos({ data, onUpdate }: Props) {
  const e = data.elementos ?? ELEMENTOS_VAZIOS;

  const set = (partial: Partial<ElementosHistoria>) => {
    onUpdate({ elementos: { ...e, ...partial } });
  };

  const setVinculo = (i: number, campo: "nome" | "relacao", valor: string) => {
    const vinculos = e.vinculos.map((v, idx) => (idx === i ? { ...v, [campo]: valor } : v));
    set({ vinculos });
  };

  return (
    <div className="space-y-10 max-w-2xl">
      <p className="font-crimson text-sm italic text-arcana-text-dim">
        Estes elementos alimentam a história do seu personagem. Tudo aqui é
        narrativa: nada concede dinheiro, itens ou habilidades — isso vem das
        regras, com o Juiz.
      </p>

      {/* Conceito */}
      <div className="space-y-2">
        <label htmlFor="el-conceito" className={LABEL}>
          Conceito
        </label>
        <input
          id="el-conceito"
          type="text"
          value={e.conceito}
          onChange={(ev) => set({ conceito: ev.target.value })}
          placeholder='Quem é e o que faz — ex.: "ex-padre que busca redenção"'
          maxLength={160}
          className="arcana-input w-full font-crimson text-lg"
        />
      </div>

      {/* Origem e ocupação */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="el-origem" className={LABEL}>
            Origem
          </label>
          <input
            id="el-origem"
            type="text"
            list="origens-oeste"
            value={e.origem}
            onChange={(ev) => set({ origem: ev.target.value })}
            placeholder="De onde veio?"
            maxLength={80}
            className="arcana-input w-full font-crimson text-lg"
          />
          <datalist id="origens-oeste">
            {ORIGENS_SUGERIDAS.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
          <p className={HELPER}>Cidade do Oeste, povos originários, Estrangeiro, Oriente…</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="el-ocupacao" className={LABEL}>
            Ocupação
          </label>
          <input
            id="el-ocupacao"
            type="text"
            list="ocupacoes-oeste"
            value={e.ocupacao}
            onChange={(ev) => set({ ocupacao: ev.target.value })}
            placeholder="Do que vive?"
            maxLength={80}
            className="arcana-input w-full font-crimson text-lg"
          />
          <datalist id="ocupacoes-oeste">
            {OCUPACOES_SUGERIDAS.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Família */}
      <div className="space-y-3">
        <span className={LABEL}>Tem família?</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["sim", "Sim"],
              ["nao", "Não"],
              ["complicada", "É complicado"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => set({ familia: id })}
              className={e.familia === id ? "arcana-chip-active" : "arcana-chip"}
            >
              {label}
            </button>
          ))}
        </div>
        {e.familia && e.familia !== "nao" && (
          <textarea
            value={e.familiaDetalhe}
            onChange={(ev) => set({ familiaDetalhe: ev.target.value })}
            placeholder="Quem são? Onde estão? O que ficou em aberto?"
            maxLength={400}
            rows={2}
            className="arcana-input w-full font-crimson text-lg resize-none"
          />
        )}
      </div>

      {/* Passado sombrio */}
      <div className="space-y-3">
        <span className={LABEL}>Passado sombrio</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => set({ passadoSombrio: !e.passadoSombrio })}
            className={e.passadoSombrio ? "arcana-chip-active" : "arcana-chip"}
          >
            {e.passadoSombrio ? "Carrega um passado sombrio" : "Marcar passado sombrio"}
          </button>
        </div>
        {e.passadoSombrio && (
          <>
            <textarea
              value={e.passadoDetalhe}
              onChange={(ev) => set({ passadoDetalhe: ev.target.value })}
              placeholder="O que aconteceu? Quem sabe? O que ainda persegue seu personagem?"
              maxLength={400}
              rows={2}
              className="arcana-input w-full font-crimson text-lg resize-none"
            />
            <p className={HELPER}>
              Um crime no passado pode render recompensa pela cabeça — mas o valor é
              decisão do Juiz, não da biografia.
            </p>
          </>
        )}
      </div>

      {/* Facção */}
      <div className="space-y-3">
        <span className={LABEL}>Relação com facções do Oeste</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {FACCOES.map((f) => {
            const active = e.faccaoId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => set({ faccaoId: f.id, faccaoRelacao: f.id === "nenhuma" ? "" : e.faccaoRelacao })}
                className={[
                  "text-left rounded-xl px-4 py-3 transition-all",
                  active ? "arcana-item-selected" : "arcana-item-idle",
                ].join(" ")}
              >
                <span className="block font-cinzel text-xs uppercase tracking-[0.15em] text-arcana-text">
                  {f.nome}
                </span>
                <span className="block font-crimson text-sm text-arcana-text-dim mt-0.5">
                  {f.descricao}
                </span>
              </button>
            );
          })}
        </div>
        {e.faccaoId !== "nenhuma" && (
          <div className="space-y-2">
            <input
              type="text"
              value={e.faccaoRelacao}
              onChange={(ev) => set({ faccaoRelacao: ev.target.value })}
              placeholder="Qual é a relação? Ex.: ex-membro, inimigo jurado, devedor…"
              maxLength={160}
              className="arcana-input w-full font-crimson text-lg"
            />
            <div className="flex flex-wrap gap-2">
              {RELACOES_FACCAO_SUGERIDAS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set({ faccaoRelacao: r })}
                  className="arcana-chip"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vínculos */}
      <div className="space-y-3">
        <span className={LABEL}>Vínculos</span>
        <p className={HELPER}>
          Pessoas que importam: aliados, rivais, amores, credores. A IA dá vida a eles.
        </p>
        {e.vinculos.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={v.nome}
              onChange={(ev) => setVinculo(i, "nome", ev.target.value)}
              placeholder="Nome"
              maxLength={60}
              className="arcana-input flex-1 font-crimson text-lg"
            />
            <input
              type="text"
              value={v.relacao}
              onChange={(ev) => setVinculo(i, "relacao", ev.target.value)}
              placeholder="Relação"
              maxLength={60}
              className="arcana-input flex-1 font-crimson text-lg"
            />
            <button
              type="button"
              onClick={() => set({ vinculos: e.vinculos.filter((_, idx) => idx !== i) })}
              aria-label={`Remover vínculo ${v.nome || i + 1}`}
              className="arcana-btn-ghost arcana-btn-sm shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
        {e.vinculos.length < 5 && (
          <button
            type="button"
            onClick={() => set({ vinculos: [...e.vinculos, { nome: "", relacao: "" }] })}
            className="arcana-btn-ghost arcana-btn-sm"
          >
            + Adicionar vínculo
          </button>
        )}
      </div>

      {/* Redenção */}
      <div className="space-y-3">
        <span className={LABEL}>Trilha de Redenção</span>
        <p className={HELPER}>
          O problema do passado que seu personagem carrega — o coração da história em
          Sacramento. Seis passos; o último encerra a jornada.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TRILHAS_REDENCAO.map((t) => {
            const active = e.redencaoTrilhaId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => set({ redencaoTrilhaId: t.id })}
                className={[
                  "text-left rounded-xl px-4 py-3 transition-all",
                  active ? "arcana-item-selected" : "arcana-item-idle",
                ].join(" ")}
              >
                <span className="block font-cinzel text-xs uppercase tracking-[0.15em] text-arcana-text">
                  {t.nome}
                </span>
                <span className="block font-crimson text-sm text-arcana-text-dim mt-0.5">
                  {t.premissa}
                </span>
              </button>
            );
          })}
        </div>
        {e.redencaoTrilhaId && (
          <textarea
            value={e.redencaoPremissa}
            onChange={(ev) => set({ redencaoPremissa: ev.target.value })}
            placeholder={
              e.redencaoTrilhaId === "propria"
                ? "Descreva o problema do passado e como imagina a resolução final"
                : "Contexto seu para essa trilha: quem, onde, por quê? (opcional)"
            }
            maxLength={400}
            rows={2}
            className="arcana-input w-full font-crimson text-lg resize-none"
          />
        )}
      </div>
    </div>
  );
}
