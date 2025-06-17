import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DisponibilidadeFilter, PrecoPessoas } from "@/lib/supabase";
import { useDisponibilidades } from "@/hooks/use-packages";
import { format } from "date-fns";

interface Room {
  adults: number;
  children0to3: number;
  children4to5: number;
  children6plus: number;
}

export function useResultados() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Processar parâmetros da URL para reconstruir os quartos
  const parseRoomsFromURL = (): Room[] => {
    const quartos = parseInt(searchParams.get("quartos") || "1");

    // ✅ CORREÇÃO CRÍTICA: Se múltiplos quartos, usar getQuartosIndividuais()
    if (quartos > 1) {
      return getQuartosIndividuais();
    }

    // Para quarto único, usar lógica simples
    const totalAdultos = parseInt(searchParams.get("adultos") || "2");
    const totalCriancas0_3 = parseInt(searchParams.get("criancas_0_3") || "0");
    const totalCriancas4_5 = parseInt(searchParams.get("criancas_4_5") || "0");
    const totalCriancas6 = parseInt(searchParams.get("criancas_6") || "0");

    return [
      {
        adults: totalAdultos,
        children0to3: totalCriancas0_3,
        children4to5: totalCriancas4_5,
        children6plus: totalCriancas6,
      },
    ];
  };

  // ✅ NOVA FUNÇÃO: Lê configuração específica por quarto da URL
  const getQuartosIndividuais = (): Room[] => {
    const quartos = parseInt(searchParams.get("quartos") || "1");

    // 🎯 TENTAR LER CONFIGURAÇÃO ESPECÍFICA PRIMEIRO
    const roomsConfigParam = searchParams.get("rooms_config");
    if (roomsConfigParam) {
      try {
        const configDecoded = JSON.parse(decodeURIComponent(roomsConfigParam));
        console.log("🎯 CONFIGURAÇÃO ESPECÍFICA ENCONTRADA:", configDecoded);

        return configDecoded.map((room: any, index: number) => ({
          adults: room.adults || 0,
          children0to3: room.children0to3 || 0,
          children4to5: room.children4to5 || 0,
          children6plus: room.children6plus || 0,
        }));
      } catch (error) {
        console.log("⚠️ Erro ao decodificar rooms_config, usando fallback");
      }
    }

    // 🔄 FALLBACK: Distribuição automática (como antes)
    const totalAdultos = parseInt(searchParams.get("adultos") || "2");
    const totalCriancas0_3 = parseInt(
      searchParams.get("criancas_0_3") || "0"
    );
    const totalCriancas4_5 = parseInt(
      searchParams.get("criancas_4_5") || "0"
    );
    const totalCriancas6 = parseInt(searchParams.get("criancas_6") || "0");

    console.log("🔄 USANDO DISTRIBUIÇÃO AUTOMÁTICA (FALLBACK):");
    console.log(
      `📊 Total: ${quartos} quartos, ${totalAdultos} adultos, ${
        totalCriancas0_3 + totalCriancas4_5 + totalCriancas6
      } crianças`
    );

    // Se só tem 1 quarto, colocar todas as pessoas nele
    if (quartos === 1) {
      return [
        {
          adults: totalAdultos,
          children0to3: totalCriancas0_3,
          children4to5: totalCriancas4_5,
          children6plus: totalCriancas6,
        },
      ];
    }

    // ✅ MÚLTIPLOS QUARTOS: Distribuir pessoas equilibradamente
    const rooms: Room[] = [];
    let adultosRestantes = totalAdultos;
    let criancas0_3Restantes = totalCriancas0_3;
    let criancas4_5Restantes = totalCriancas4_5;
    let criancas6Restantes = totalCriancas6;

    for (let i = 0; i < quartos; i++) {
      // Distribuir de forma equilibrada
      const adultosPorQuarto = Math.floor(adultosRestantes / (quartos - i));
      const criancas0_3PorQuarto = Math.floor(
        criancas0_3Restantes / (quartos - i)
      );
      const criancas4_5PorQuarto = Math.floor(
        criancas4_5Restantes / (quartos - i)
      );
      const criancas6PorQuarto = Math.floor(criancas6Restantes / (quartos - i));

      const quartoAtual = {
        adults: adultosPorQuarto,
        children0to3: criancas0_3PorQuarto,
        children4to5: criancas4_5PorQuarto,
        children6plus: criancas6PorQuarto,
      };

      rooms.push(quartoAtual);

      adultosRestantes -= adultosPorQuarto;
      criancas0_3Restantes -= criancas0_3PorQuarto;
      criancas4_5Restantes -= criancas4_5PorQuarto;
      criancas6Restantes -= criancas6PorQuarto;

      console.log(
        `   Quarto ${i + 1}: ${quartoAtual.adults} adultos, ${
          quartoAtual.children0to3 +
          quartoAtual.children4to5 +
          quartoAtual.children6plus
        } crianças`
      );
    }

    // Distribuir pessoas restantes no primeiro quarto
    if (adultosRestantes > 0) rooms[0].adults += adultosRestantes;
    if (criancas0_3Restantes > 0)
      rooms[0].children0to3 += criancas0_3Restantes;
    if (criancas4_5Restantes > 0)
      rooms[0].children4to5 += criancas4_5Restantes;
    if (criancas6Restantes > 0) rooms[0].children6plus += criancas6Restantes;

    console.log("🎯 DISTRIBUIÇÃO FINAL:", rooms);
    return rooms;
  };

  // Pessoas para cálculo de preço baseado nos parâmetros da URL
  const [pessoas, setPessoas] = useState<PrecoPessoas>({
    adultos: parseInt(searchParams.get("adultos") || "2"),
    criancas_0_3: parseInt(searchParams.get("criancas_0_3") || "0"),
    criancas_4_5: parseInt(searchParams.get("criancas_4_5") || "0"),
    criancas_6_mais: parseInt(searchParams.get("criancas_6") || "0"),
  });

  // Filtros baseados nos parâmetros da URL
  const [filters, setFilters] = useState<DisponibilidadeFilter>({
    destino: searchParams.get("destino") || undefined,
    cidade_saida: searchParams.get("salida") || undefined,
    transporte: searchParams.get("transporte") || undefined,
    data_saida: searchParams.get("data") || undefined,
  });

  // ✅ NOVO: Estado para a configuração de quartos, derivado da URL
  const [quartosConfig, setQuartosConfig] = useState<Room[]>(() => parseRoomsFromURL());

  // ✅ NOVO: Mover estado de ordenação para o hook
  const [sortBy, setSortBy] = useState("relevance");

  // ✅ NOVO: Mover estados do GPT para o hook
  const [sugestoes, setSugestoes] = useState<string[] | null>(null);
  const [pacotesGPT, setPacotesGPT] = useState<any[] | null>(null);
  const [loadingGPT, setLoadingGPT] = useState(false);
  const [useGPTResults, setUseGPTResults] = useState(false);

  // Usar hook do Supabase para buscar disponibilidades
  const { disponibilidades, loading, error } = useDisponibilidades(filters);

  // ✅ CORREÇÃO: Efeito para sincronizar TODO o estado com os parâmetros da URL
  useEffect(() => {
    console.log("🔍 URL changed, re-evaluating ALL state from searchParams...");
    
    const newFilters = {
      destino: searchParams.get("destino") || undefined,
      cidade_saida: searchParams.get("salida") || undefined,
      transporte: searchParams.get("transporte") || undefined,
      data_saida: searchParams.get("data") || undefined,
    };
    setFilters(newFilters);

    const newPessoas = {
      adultos: parseInt(searchParams.get("adultos") || "2"),
      criancas_0_3: parseInt(searchParams.get("criancas_0_3") || "0"),
      criancas_4_5: parseInt(searchParams.get("criancas_4_5") || "0"),
      criancas_6_mais: parseInt(searchParams.get("criancas_6") || "0"),
    };
    setPessoas(newPessoas);
    
    // Atualiza a configuração dos quartos também
    setQuartosConfig(parseRoomsFromURL());
    
    // Resetar o modo GPT se for uma busca normal
    if (useGPTResults && !searchParams.has('gpt')) {
        setUseGPTResults(false);
    }

  }, [searchParams]);

  // 💰 VALORES CORRETOS DO SUPABASE (conforme tabela disponibilidades)
  const valoresReaisSupabase = {
    preco_adulto: 490, // R$ 490,00
    preco_crianca_0_3: 50, // R$ 50,00
    preco_crianca_4_5: 350, // R$ 350,00
    preco_crianca_6_mais: 490, // R$ 490,00
  };

  // Função para validar e usar dados corretos de preços
  const validarDadosPreco = (disponibilidade: any) => {
    // 🔧 GARANTIR que usamos os valores corretos do Supabase
    const precoAdulto =
      Number(disponibilidade.preco_adulto) ||
      valoresReaisSupabase.preco_adulto;
    const precoCrianca03 =
      Number(disponibilidade.preco_crianca_0_3) ||
      valoresReaisSupabase.preco_crianca_0_3;
    const precoCrianca45 =
      Number(disponibilidade.preco_crianca_4_5) ||
      valoresReaisSupabase.preco_crianca_4_5;
    const precoCrianca6mais =
      Number(disponibilidade.preco_crianca_6_mais) ||
      valoresReaisSupabase.preco_crianca_6_mais;

    console.log("💰 Preços validados:", {
      hotel: disponibilidade.hotel,
      original: {
        adulto: disponibilidade.preco_adulto,
        crianca_0_3: disponibilidade.preco_crianca_0_3,
        crianca_4_5: disponibilidade.preco_crianca_4_5,
        crianca_6_mais: disponibilidade.preco_crianca_6_mais,
      },
      validado: {
        adulto: precoAdulto,
        crianca_0_3: precoCrianca03,
        crianca_4_5: precoCrianca45,
        crianca_6_mais: precoCrianca6mais,
      },
    });

    return {
      ...disponibilidade,
      preco_adulto: precoAdulto,
      preco_crianca_0_3: precoCrianca03,
      preco_crianca_4_5: precoCrianca45,
      preco_crianca_6_mais: precoCrianca6mais,
    };
  };

  // Função para calcular preço total com validação USANDO DADOS DO SUPABASE
  const calcularPrecoTotalSeguro = (
    disponibilidade: any,
    pessoas: PrecoPessoas
  ): number => {
    const dadosValidados = validarDadosPreco(disponibilidade);

    const precoAdultos = dadosValidados.preco_adulto * pessoas.adultos;
    const precoCriancas03 =
      dadosValidados.preco_crianca_0_3 * pessoas.criancas_0_3;
    const precoCriancas45 =
      dadosValidados.preco_crianca_4_5 * pessoas.criancas_4_5;
    const precoCriancas6mais =
      dadosValidados.preco_crianca_6_mais * pessoas.criancas_6_mais;

    const total =
      precoAdultos + precoCriancas03 + precoCriancas45 + precoCriancas6mais;

    // Debug log
    console.log("🧮 Cálculo usando dados do Supabase:", {
      hotel: disponibilidade.hotel,
      pessoas,
      precos: {
        adulto: dadosValidados.preco_adulto,
        crianca_0_3: dadosValidados.preco_crianca_0_3,
        crianca_4_5: dadosValidados.preco_crianca_4_5,
        crianca_6_mais: dadosValidados.preco_crianca_6_mais,
      },
      total,
    });

    return isNaN(total) ? 0 : total;
  };

  // ✅ FUNÇÃO PARA CALCULAR PREÇO POR QUARTO USANDO DADOS REAIS DO SUPABASE
  const calcularPrecoQuarto = (disponibilidade: any, quarto: Room): number => {
    const dadosValidados = validarDadosPreco(disponibilidade);

    const precoAdultos = dadosValidados.preco_adulto * quarto.adults;
    const precoCriancas03 =
      dadosValidados.preco_crianca_0_3 * quarto.children0to3;
    const precoCriancas45 =
      dadosValidados.preco_crianca_4_5 * quarto.children4to5;
    const precoCriancas6mais =
      dadosValidados.preco_crianca_6_mais * quarto.children6plus;

    const total =
      precoAdultos + precoCriancas03 + precoCriancas45 + precoCriancas6mais;

    console.log("🧮 Cálculo usando dados do Supabase:", {
      hotel: disponibilidade.hotel,
      quarto,
      precos: {
        adulto: dadosValidados.preco_adulto,
        crianca_0_3: dadosValidados.preco_crianca_0_3,
        crianca_4_5: dadosValidados.preco_crianca_4_5,
        crianca_6_mais: dadosValidados.preco_crianca_6_mais,
      },
      total,
    });

    return isNaN(total) ? 0 : total;
  };

  // ✅ NOVO: Função para determinar tipo de quarto baseado na ocupação
  const determinarTipoQuarto = (quarto: Room): string => {
    const totalPessoas =
      quarto.adults +
      quarto.children0to3 +
      quarto.children4to5 +
      quarto.children6plus;

    if (totalPessoas === 1) return "Individual";
    if (totalPessoas === 2) return "Doble";
    if (totalPessoas === 3) return "Triple";
    if (totalPessoas === 4) return "Cuádruple";
    if (totalPessoas === 5) return "Quíntuple";
    return "Suite Familiar";
  };

  // ✅ NOVO: Função para formatar ocupação do quarto
  const formatarOcupacaoQuarto = (quarto: Room): string => {
    const partes = [];

    if (quarto.adults > 0) {
      partes.push(`${quarto.adults} Adulto${quarto.adults > 1 ? "s" : ""}`);
    }

    const totalCriancas =
      quarto.children0to3 + quarto.children4to5 + quarto.children6plus;
    if (totalCriancas > 0) {
      partes.push(`${totalCriancas} Niño${totalCriancas > 1 ? "s" : ""}`);
    }

    return partes.join(", ");
  };

  // Função para verificar se um pacote comporta os quartos solicitados
  const verificarCapacidadeQuartos = (disponibilidade: any, quartos: Room[]): boolean => {
    const totalPessoas = quartos.reduce((total, room) => 
      total + room.adults + room.children0to3 + room.children4to5 + room.children6plus, 0
    )
    
    console.log(`🔍 Verificando capacidade: ${disponibilidade.hotel} - ${disponibilidade.quarto_tipo}`)
    console.log(`   Capacidade do quarto: ${disponibilidade.capacidade}`)
    console.log(`   Total pessoas solicitadas: ${totalPessoas}`)
    
    // ✅ CORREÇÃO: Lógica mais flexível para múltiplos quartos
    const numQuartos = quartos.length
    if (numQuartos > 1) {
      // Para múltiplos quartos, verificar se cada quarto individual pode ser acomodado
      const pessoasPorQuarto = Math.ceil(totalPessoas / numQuartos)
      const comporta = disponibilidade.capacidade >= pessoasPorQuarto
      console.log(`   🏠 ${numQuartos} quartos: ~${pessoasPorQuarto} pessoas/quarto - Comporta: ${comporta ? '✅' : '❌'}`)
      return comporta
    } else {
      // Para quarto único, usar lógica original
      const comporta = disponibilidade.capacidade >= totalPessoas
      console.log(`   🏠 1 quarto: ${totalPessoas} pessoas total - Comporta: ${comporta ? '✅' : '❌'}`)
      return comporta
    }
  }

  // Função para filtrar pacotes válidos antes de exibir ou enviar ao GPT
  const filtrarPacotesValidos = (pacotes: any[], dataSelecionada?: string, quartos?: Room[]) => {
    if (!pacotes || pacotes.length === 0) return [];

    let pacotesFiltrados = [...pacotes];

    // ETAPA 1: FILTRO DE CAPACIDADE (sempre aplicado)
    if (quartos && quartos.length > 0) {
      pacotesFiltrados = pacotesFiltrados.filter(pacote => verificarCapacidadeQuartos(pacote, quartos));
    }
    
    // Se não há data, a lógica para aqui, apenas diversificando os hotéis.
    if (!dataSelecionada) {
        const pacotesPorHotel = new Map<string, any>();
        pacotesFiltrados.forEach(pacote => {
            if (!pacotesPorHotel.has(pacote.hotel)) {
                pacotesPorHotel.set(pacote.hotel, pacote);
            }
        });
        return Array.from(pacotesPorHotel.values());
    }

    // ETAPA 2: LÓGICA DE FILTRO POR DATA (MAIS ROBUSTA)

    // 2a: Pontuar TODOS os pacotes filtrados por capacidade
    const pacotesPontuados = pacotesFiltrados.map(pacote => {
      // ✅ FUSO HORÁRIO: Forçar UTC para consistência
      const dataPacote = new Date(`${pacote.data_saida}T00:00:00`);
      const dataAlvo = new Date(`${dataSelecionada}T00:00:00`);
      const diffDias = Math.abs((dataPacote.getTime() - dataAlvo.getTime()) / (1000 * 60 * 60 * 24));
      
      let pontos = 0;
      if (diffDias <= 7) pontos = 100;
      else if (diffDias <= 15) pontos = 90;
      else if (diffDias <= 30) pontos = 80;
      else if (diffDias <= 60) pontos = 50;
      else pontos = 20;
      
      return { ...pacote, pontuacao: pontos, data_pacote: dataPacote };
    }).sort((a, b) => b.pontuacao - a.pontuacao); // Ordenar para achar o melhor

    // Se não há nenhum pacote pontuado, retorna array vazio.
    if (pacotesPontuados.length === 0) {
        return [];
    }

    // 2b: Descobrir o "Mês de Ouro" a partir do melhor resultado
    const melhorResultado = pacotesPontuados[0];
    // ✅ FUSO HORÁRIO: Usar getUTCMonth() para evitar erros
    const mesDeOuro = melhorResultado.data_pacote.getUTCMonth();
    const anoDeOuro = melhorResultado.data_pacote.getUTCFullYear();

    // 2c: Filtrar rigorosamente pelo "Mês de Ouro"
    const pacotesDoMesCerto = pacotesPontuados.filter(pacote => 
        // ✅ FUSO HORÁRIO: Usar getUTCMonth() para evitar erros
        pacote.data_pacote.getUTCMonth() === mesDeOuro && 
        pacote.data_pacote.getUTCFullYear() === anoDeOuro
    );

    // ETAPA 3: AGRUPAR E SELECIONAR MELHOR DE CADA HOTEL
    const pacotesPorHotel = new Map<string, any>();
    pacotesDoMesCerto.forEach(pacote => {
        // Se o hotel ainda não está na lista, adiciona.
        // Como a lista já está ordenada por pontuação, o primeiro a ser visto é o melhor.
        if (!pacotesPorHotel.has(pacote.hotel)) {
            pacotesPorHotel.set(pacote.hotel, pacote);
        }
    });

    return Array.from(pacotesPorHotel.values());
  }

  // Ordenar resultados com base na seleção do usuário ou relevância
  const ordenarResultadosInteligente = (resultados: any[], dataSelecionada?: string) => {
    // ✅ FUSO HORÁRIO: Forçar UTC para consistência
    const dataAlvo = dataSelecionada ? new Date(`${dataSelecionada}T00:00:00`) : null

    return [...resultados].sort((a, b) => {
      switch (sortBy) {
        case "relevance":
          // A lógica de relevância agora é tratada inteiramente pela `filtrarPacotesValidos`.
          // Manter a ordem que já recebemos.
          return 0;
        case "priceAsc":
          return (
            calcularPrecoTotalSeguro(a, pessoas) -
            calcularPrecoTotalSeguro(b, pessoas)
          )
        case "priceDesc":
          return (
            calcularPrecoTotalSeguro(b, pessoas) -
            calcularPrecoTotalSeguro(a, pessoas)
          )
        case "date":
          if (dataAlvo) {
            // ✅ FUSO HORÁRIO: Forçar UTC para consistência
            const dataA = new Date(`${a.data_saida}T00:00:00`);
            const dataB = new Date(`${b.data_saida}T00:00:00`);
            const diffA = Math.abs(dataA.getTime() - dataAlvo.getTime());
            const diffB = Math.abs(dataB.getTime() - dataAlvo.getTime());
            return diffA - diffB;
          }
          return 0;
        default:
          return 0;
      }
    });
  }

  // Função para obter sugestões do GPT
  const handleSugestaoGPT = async () => {
    setLoadingGPT(true)
    try {
      const response = await fetch("/api/sugestao-viagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponibilidades, filtrosAtuais: filters, pessoas }),
      })
      const data = await response.json()
      setSugestoes(data.sugestoes || ["Nenhuma sugestão disponível."])
    } catch (error) {
      console.error("Erro ao buscar sugestões do GPT:", error)
      setSugestoes(["Erro ao carregar sugestões."])
    } finally {
      setLoadingGPT(false)
    }
  }

  // Função para buscar com GPT
  const buscarComGPT = async (filtros: any) => {
    setLoadingGPT(true)
    setPacotesGPT(null)
    setSugestoes(null)
    setUseGPTResults(true)
    try {
      const response = await fetch("/api/buscar-com-gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filtros, disponibilidades }),
      })
      const data = await response.json()
      console.log('🤖 RESPOSTA DA API GPT:', data)
      if (data.pacotesRecomendados && data.pacotesRecomendados.length > 0) {
        setPacotesGPT(data.pacotesRecomendados)
      } else {
        setPacotesGPT([])
      }
      setSugestoes(data.sugestoes || [])
    } catch (err) {
      console.error("Erro na busca com GPT:", err)
      setPacotesGPT([])
      setSugestoes(["Ocorreu um erro ao buscar recomendações."])
    } finally {
      setLoadingGPT(false)
    }
  }

  // ✅ NOVO: Mover handlers de busca para o hook
  const handleFilterSearch = async (searchFilters: any) => {
    console.log("▶️ INICIANDO NOVA BUSCA (handleFilterSearch):", searchFilters)
    
    // ✅ CORREÇÃO CRÍTICA: Garantir que `rooms_config` está sendo usado corretamente
    const roomsConfig = searchFilters.quartos.map((q: any) => ({
      adults: q.adults,
      children0to3: q.children0to3,
      children4to5: q.children4to5,
      children6plus: q.children6plus
    }))
    
    // Calcular totais para a URL (fallback)
    const totalAdultos = roomsConfig.reduce((acc: number, q: any) => acc + q.adults, 0)
    const totalCriancas0_3 = roomsConfig.reduce((acc: number, q: any) => acc + q.children0to3, 0)
    const totalCriancas4_5 = roomsConfig.reduce((acc: number, q: any) => acc + q.children4to5, 0)
    const totalCriancas6 = roomsConfig.reduce((acc: number, q: any) => acc + q.children6plus, 0)
    
    // Construir a URL
    const params = new URLSearchParams()
    params.set("destino", searchFilters.destino || "")
    params.set("salida", searchFilters.cidade_saida || "")
    params.set("transporte", searchFilters.transporte || "")
    params.set("data", searchFilters.data_saida || "")
    params.set("quartos", String(roomsConfig.length))
    
    // Fallback params
    params.set("adultos", String(totalAdultos))
    params.set("criancas_0_3", String(totalCriancas0_3))
    params.set("criancas_4_5", String(totalCriancas4_5))
    params.set("criancas_6", String(totalCriancas6))
    
    // 🎯 ADICIONAR CONFIGURAÇÃO ESPECÍFICA DE QUARTOS
    params.set("rooms_config", encodeURIComponent(JSON.stringify(roomsConfig)))

    // Usar GPT?
    if (searchFilters.useGPT) {
      console.log('🤖 GPT Solicitado. Ativando modo GPT.')
      setUseGPTResults(true)
      await buscarComGPT(searchFilters)
    } else {
      console.log('🔄 BUSCA NORMAL. Redirecionando...')
      setUseGPTResults(false)
      // Forçar recarregamento da página com os novos parâmetros
      router.push(`/resultados?${params.toString()}`)
    }
  }

  const handleNormalFilterSearch = (searchFilters: any) => {
    const params = new URLSearchParams();

    // Constrói a URL a partir do zero, usando apenas os dados recebidos do filtro.
    if (searchFilters.salida) params.set('salida', searchFilters.salida);
    if (searchFilters.destino) params.set('destino', searchFilters.destino);
    if (searchFilters.data) params.set('data', format(searchFilters.data, 'yyyy-MM-dd'));
    if (searchFilters.transporte) params.set('transporte', searchFilters.transporte);

    if (searchFilters.rooms && searchFilters.rooms.length > 0) {
      const rooms = searchFilters.rooms;
      params.set('quartos', rooms.length.toString());
      
      // ✅ CORRIGIDO: Lendo as propriedades com sublinhado, como vêm do filtro.
      const totalAdultos = rooms.reduce((sum: number, room: any) => sum + room.adults, 0);
      const totalCriancas03 = rooms.reduce((sum: number, room: any) => sum + room.children_0_3, 0);
      const totalCriancas45 = rooms.reduce((sum: number, room: any) => sum + room.children_4_5, 0);
      const totalCriancas6 = rooms.reduce((sum: number, room: any) => sum + room.children_6, 0);

      params.set('adultos', totalAdultos.toString());
      params.set('criancas_0_3', totalCriancas03.toString());
      params.set('criancas_4_5', totalCriancas45.toString());
      params.set('criancas_6', totalCriancas6.toString());
      
      // ✅ CORRIGIDO: Mapeando de `_` para a versão sem `_` para a URL.
      const roomsConfig = rooms.map((room: any) => ({
        adults: room.adults,
        children0to3: room.children_0_3,
        children4to5: room.children_4_5,
        children6plus: room.children_6,
      }));
      params.set('rooms_config', encodeURIComponent(JSON.stringify(roomsConfig)));
    }

    // Limpa o estado da IA e navega.
    setUseGPTResults(false);
    setPacotesGPT(null);
    setSugestoes(null);

    router.push(`/resultados?${params.toString()}`);
  }

  return {
    disponibilidades,
    loading,
    error,
    quartosConfig,
    pessoas,
    filters,
    sortBy,
    setSortBy,
    sugestoes,
    pacotesGPT,
    loadingGPT,
    useGPTResults,
    setUseGPTResults,
    calcularPrecoTotalSeguro,
    calcularPrecoQuarto,
    determinarTipoQuarto,
    formatarOcupacaoQuarto,
    filtrarPacotesValidos,
    ordenarResultadosInteligente,
    handleSugestaoGPT,
    handleFilterSearch,
    handleNormalFilterSearch,
    buscarComGPT,
    valoresReaisSupabase,
  };
}