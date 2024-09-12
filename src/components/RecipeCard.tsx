// RecipeCard.tsx
import React from 'react';
import { Card } from '@/components/ui/Card';

interface RecipeCardProps {
  productName: string;
  recipeCount: number;
  onClick: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ productName, recipeCount, onClick }) => {
  return (
    <div onClick={onClick}>
      <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200">
        <h3 className="text-lg font-semibold mb-2">{productName}</h3>
        <p className="text-sm text-gray-600">Recetas: {recipeCount}</p>
      </Card>
    </div>
  );
};
