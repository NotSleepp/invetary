import React from 'react';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface RecipeCardProps {
  productName: string;
  recipeCount: number;
  totalProductionCost: number | undefined;
  onClick: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ productName, recipeCount, totalProductionCost, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-shadow duration-300 bg-white">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">{productName}</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Número de Ingredientes:</span> {recipeCount}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Costo de producción total:</span>{' '}
              {totalProductionCost !== undefined ? (
                <span className="text-green-600 font-semibold">${totalProductionCost.toFixed(2)}</span>
              ) : (
                'N/A'
              )}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};