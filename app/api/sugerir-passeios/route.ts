import { NextResponse } from 'next/server';
import { fetchPaseosData, PaseosSearchFilters } from '@/lib/passeios-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters: PaseosSearchFilters = {
    mes: searchParams.get('mes') || undefined,
    adultos: Number(searchParams.get('adultos')) || undefined,
    criancas: Number(searchParams.get('criancas')) || undefined,
  };

  try {
    const data = await fetchPaseosData(filters);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar passeios:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados dos passeios' },
      { status: 500 }
    );
  }
} 