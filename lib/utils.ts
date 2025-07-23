import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ✅ NEW: Calculate final price including taxes and fees
export function calculateFinalPrice(basePrice: number, transportType: 'Bus' | 'Bús' | 'Aéreo' | string) {
  const adminFeeRate = 0.03;
  const airTransportFee = 200;

  let adminFee = 0; // Inicia a taxa como zero

  // Apenas calcula a taxa se o transporte NÃO for Aéreo
  if (transportType !== 'Aéreo') {
    adminFee = basePrice * adminFeeRate;
  }
  
  let finalPrice = basePrice + adminFee;

  if (transportType === 'Aéreo') {
    finalPrice += airTransportFee;
  }

  return finalPrice;
}

// ✅ NEW: Calculate monthly installments for payment
export function calculateInstallments(totalPrice: number, travelDate: Date | string) {
  const today = new Date();
  const travel = new Date(travelDate);

  // Set to the first day of the month to avoid day-of-month issues
  today.setDate(1);
  travel.setDate(1);

  let months = (travel.getFullYear() - today.getFullYear()) * 12;
  months -= today.getMonth();
  months += travel.getMonth();
  
  // The number of payments is months + 1 (e.g., July to Jan is 7 payments)
  // But the logic is from next month to travel month inclusive
  const numberOfInstallments = months <= 0 ? 1 : months;

  if (numberOfInstallments <= 1) {
    return {
      installments: 1,
      installmentValue: totalPrice,
    };
  }
  
  const installmentValue = totalPrice / numberOfInstallments;

  return {
    installments: numberOfInstallments,
    installmentValue: installmentValue,
  };
}
