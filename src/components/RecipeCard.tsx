// RecipeCard.tsx
import React from 'react';
import { Card } from '@/components/ui/Card';

interface RecipeCardProps {
  productName: string;
  recipeCount: number;
  totalProductionCost: number | undefined;
  onClick: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ productName, recipeCount, totalProductionCost, onClick }) => {
  return (
    <div onClick={onClick} className="cursor-pointer">
      <Card className="hover:shadow-lg transition-shadow">
        <div className="p-4">
          <h3 className="text-lg font-semibold">{productName}</h3>
          <p>Número de Ingredientes: {recipeCount}</p>
          <p>Costo de producción total: {totalProductionCost !== undefined ? `$${totalProductionCost.toFixed(2)}` : 'N/A'}</p>
        </div>
      </Card>
    </div>
  );
};
