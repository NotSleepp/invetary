'use client';

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { ProductionLog, Product, Recipe, Material } from "@/types";
import { useToast } from "@/contexts/ToastContext";

interface ProductionFormProps {
  productionLog?: ProductionLog;
  onSubmit: (data: Partial<ProductionLog>) => Promise<void>;
  products: (Product & { recipes: Recipe[] })[];
  materials: Material[];
  userId: number;
  branchId: number;
}

interface MaterialNeeded {
  id: string;
  name: string;
  quantity: number;
  stock: number;
}

export const ProductionForm: React.FC<ProductionFormProps> = ({
  productionLog,
  onSubmit,
  products,
  materials,
  userId,
  branchId,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<Partial<ProductionLog>>({
    defaultValues: productionLog || {},
  });
  const { showToast } = useToast();

  const [selectedProduct, setSelectedProduct] = useState<(Product & { recipes: Recipe[] }) | null>(null);
  const [materialsNeeded, setMaterialsNeeded] = useState<MaterialNeeded[]>([]);

  const productId = watch("product_id");
  const quantityProduced = watch("quantity_produced");

  useEffect(() => {
    if (productId) {
      const product = products.find((p) => Number(p.id) === Number(productId));
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [productId, products]);

  useEffect(() => {
    if (selectedProduct && quantityProduced) {
      const neededMaterials: MaterialNeeded[] = selectedProduct.recipes.map((recipe) => {
        const material = materials.find((m) => Number(m.id) === Number(recipe.material_id));
        return {
          id: recipe.material_id,
          name: material?.name || "Unknown",
          quantity: recipe.quantity_per_product * Number(quantityProduced),
          stock: material?.stock_quantity || 0,
        };
      });
      setMaterialsNeeded(neededMaterials);
    } else {
      setMaterialsNeeded([]);
    }
  }, [selectedProduct, quantityProduced, materials]);

  const onSubmitForm = async (data: Partial<ProductionLog>): Promise<void> => {
    try {
      if (!selectedProduct) {
        throw new Error("No se ha seleccionado un producto");
      }

      if (!selectedProduct.recipes || selectedProduct.recipes.length === 0) {
        throw new Error("El producto seleccionado no tiene recetas asociadas");
      }

      const stockInsuficiente = materialsNeeded.some(
        (material) => material.quantity > material.stock
      );

      if (stockInsuficiente) {
        showToast(
          "Stock insuficiente de materiales para completar la producción",
          "error"
        );
        return;
      }

      const totalCost = selectedProduct.recipes.reduce((acc, recipe) => {
        const material = materials.find(
          (m) => m.id === recipe.material_id
        );
        return (
          acc +
          (material?.cost_per_unit || 0) *
            recipe.quantity_per_product *
            (Number(data.quantity_produced) || 0)
        );
      }, 0);

      const payload = {
        product_id: data.product_id,
        quantity_produced: data.quantity_produced,
        total_cost: totalCost,
        branch_id: branchId
      };

      await onSubmit(payload);
    } catch (error) {
      showToast(`Error al guardar el registro de producción: ${(error as Error).message}`, "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <Select
        label="Producto"
        options={products.map((product) => ({
          value: String(product.id),
          label: product.name,
        }))}
        {...register("product_id", { required: "El producto es requerido" })}
        error={errors.product_id?.message}
      />
      <Input
        label="Cantidad Producida"
        type="number"
        {...register("quantity_produced", {
          required: "La cantidad es requerida",
          min: { value: 1, message: "La cantidad debe ser mayor que 0" },
        })}
        error={errors.quantity_produced?.message}
      />
      {materialsNeeded.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Materiales Necesarios:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {materialsNeeded.map((material, index) => (
              <li
                key={`${material.id}-${index}`}
                className={material.quantity > material.stock ? "text-red-500" : ""}
              >
                {material.name}: {material.quantity.toFixed(2)}
                {material.quantity > material.stock && " (Stock insuficiente)"}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? "Guardando..."
          : productionLog
          ? "Actualizar Registro"
          : "Crear Registro"}
      </Button>
    </form>
  );
};
