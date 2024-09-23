"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { ProductionForm } from "@/components/ProductionForm";
import { ProductionList } from "@/components/ProductionList";
import { useToast } from "@/contexts/ToastContext";
import Spinner from "@/components/ui/Spinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useProductionStore } from "@/stores/productionStore";
import { useProductStore } from "@/stores/productStore";
import { useMaterialStore } from "@/stores/materialStore";
import { useRecipeStore } from "@/stores/recipeStore";
import { ProductionLog } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlusIcon, SearchIcon } from "lucide-react";

export default function ProductionPage() {
  const { showToast } = useToast();
  const [editingLog, setEditingLog] = useState<ProductionLog | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    productionLogs,
    isLoading: productionLoading,
    error: productionError,
    fetchProductionLogs,
    addProductionLog,
    updateProductionLog,
    deleteProductionLog,
  } = useProductionStore();

  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    fetchProducts,
    updateProduct,
  } = useProductStore();

  const {
    materials,
    isLoading: materialsLoading,
    error: materialsError,
    fetchMaterials,
    updateMaterial,
  } = useMaterialStore();

  const {
    recipes,
    isLoading: recipesLoading,
    error: recipesError,
    fetchRecipes,
  } = useRecipeStore();

  useEffect(() => {
    fetchProductionLogs();
    fetchProducts();
    fetchMaterials();
    fetchRecipes();
  }, [fetchProductionLogs, fetchProducts, fetchMaterials, fetchRecipes]);

  const handleSubmit = async (data: Partial<ProductionLog>) => {
    try {
      if (!productsWithRecipes || productsWithRecipes.length === 0) {
        throw new Error("No hay productos disponibles.");
      }

      const selectedProduct = productsWithRecipes.find(
        (p) => Number(p.id) === Number(data.product_id)
      );

      if (
        !selectedProduct ||
        !('recipes' in selectedProduct) ||
        !selectedProduct.recipes ||
        !Array.isArray(selectedProduct.recipes) ||
        selectedProduct.recipes.length === 0
      ) {
        throw new Error("El producto no tiene recetas asociadas");
      }

      // Calcular el costo total y los materiales usados
      const totalCost = selectedProduct.recipes.reduce((acc, recipe) => {
        const material = materials.find(
          (m) => String(m.id) === String(recipe.material_id)
        );
        return (
          acc +
          (material?.cost_per_unit || 0) *
            recipe.quantity_per_product *
            (Number(data.quantity_produced) || 0)
        );
      }, 0);

      // Crear o actualizar el registro de producción
      let updatedLog;
      if (editingLog) {
        updatedLog = await updateProductionLog(editingLog.id, {
          ...data,
          total_cost: totalCost,
        });
      } else {
        updatedLog = await addProductionLog({ ...data, total_cost: totalCost });
      }

      // Descontar materiales utilizados del stock
      for (const recipe of selectedProduct.recipes) {
        const material = materials.find((m) => m.id === recipe.material_id);
        if (material) {
          const cantidadUsada =
            recipe.quantity_per_product * (Number(data.quantity_produced) || 0);
          await updateMaterial(material.id, {
            stock_quantity: material.stock_quantity - cantidadUsada,
          });
        }
      }

      // Aumentar el stock del producto
      const newProductStock =
        selectedProduct.stock_quantity + Number(data.quantity_produced);
      await updateProduct(selectedProduct.id, {
        stock_quantity: newProductStock,
      });

      showToast("Registro de producción guardado con éxito", "success");
      setEditingLog(null);
      setIsModalOpen(false);
      fetchProductionLogs();
      fetchProducts();
      fetchMaterials();
    } catch (error) {
      const errorMessage = (error as Error).message;
      showToast(
        `Error al guardar el registro de producción: ${errorMessage}`,
        "error"
      );
    }
  };

  const handleEdit = (log: ProductionLog) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = (productionLogId: string) => {
    setDeletingLogId(productionLogId);
  };

  const confirmDelete = async () => {
    if (deletingLogId) {
      try {
        await deleteProductionLog(deletingLogId);
        showToast("Registro de producción eliminado con éxito", "success");
        setDeletingLogId(null);
        fetchProductionLogs();
      } catch {
        showToast("Error al eliminar el registro de producción", "error");
      }
    }
  };

  const cancelDelete = () => {
    setDeletingLogId(null);
  };

  const filteredLogs = useMemo(() => {
    return productionLogs.map((log) => {
      const product = products.find((p) => p.id === log.product_id);
      return {
        ...log,
        product_name: product ? product.name : 'Producto desconocido',
        formattedTotalCost: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(log.total_cost || 0)
      };
    }).filter((log) => 
      log.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productionLogs, products, searchTerm]);

  const productsWithRecipes = useMemo(() => {
    const productsWithRecipes = products.map((product) => ({
      ...product,
      recipes: recipes.filter((recipe) => recipe.product_id === product.id),
    }));
    return productsWithRecipes;
  }, [products, recipes]);

  if (
    productionLoading ||
    productsLoading ||
    materialsLoading ||
    recipesLoading
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (productionError || productsError || materialsError || recipesError) {
    return (
      <ErrorMessage message="Error al cargar los datos. Por favor, intente de nuevo más tarde." />
    );
  }

  return (
    <AuthGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-80 mb-4 md:mb-0">
            <Input
              type="text"
              placeholder="Buscar registros..."
              label="Búsqueda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ease-in-out"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          </div>
          <Button
            onClick={() => {
              setEditingLog(null);
              setIsModalOpen(true);
            }}
            className="w-full md:w-auto bg-gradient-to-r from-[#1e2837] to-[#101826] hover:from-[#080d14] hover:to-[#1e2837] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Crear Nuevo Registro de Producción
          </Button>
        </div>

        <ProductionList
          productionLogs={filteredLogs}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            editingLog
              ? "Editar Registro de Producción"
              : "Crear Nuevo Registro de Producción"
          }
        >
          <ProductionForm
            productionLog={editingLog || undefined}
            onSubmit={handleSubmit}
            products={productsWithRecipes}
            materials={materials}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!deletingLogId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Confirmar eliminación"
          message="¿Está seguro de que desea eliminar este registro de producción?"
        />
      </div>
    </AuthGuard>
  );
}
