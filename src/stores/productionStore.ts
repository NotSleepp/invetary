import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { ProductionLog } from "@/types";
import { useProductStore } from "./productStore";
import { useMaterialStore } from "./materialStore";
import { useRecipeStore } from "./recipeStore";

interface Recipe {
  material_id: string;
  quantity_per_product: number;
}

interface ProductionState {
  productionLogs: ProductionLog[];
  isLoading: boolean;
  error: string | null;
  fetchProductionLogs: () => Promise<void>;
  addProductionLog: (data: Partial<ProductionLog>) => Promise<void>;
  updateProductionLog: (
    id: string,
    data: Partial<ProductionLog>
  ) => Promise<void>;
  deleteProductionLog: (id: string) => Promise<void>;
}

export const useProductionStore = create<ProductionState>((set, get) => ({
  productionLogs: [],
  isLoading: false,
  error: null,

  fetchProductionLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("production_logs")
        .select("*");

      if (error) {
        throw error;
      }

      set({ productionLogs: data || [], isLoading: false });
    } catch (error) {
      set({ error: "Error fetching production logs", isLoading: false });
    }
  },

  addProductionLog: async (data) => {
    const productStore = useProductStore.getState();
    const materialStore = useMaterialStore.getState();
    const recipeStore = useRecipeStore.getState();

    try {
      const selectedProduct = productStore.products.find(
        (p) => Number(p.id) === Number(data.product_id)
      );
      if (!selectedProduct) throw new Error("Producto no encontrado");

      const recipes = recipeStore.recipes.filter(
        (recipe) => recipe.product_id === selectedProduct.id
      );
      if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
        throw new Error("El producto no tiene recetas asociadas");
      }

      const totalCost = recipes.reduce((acc: number, recipe: Recipe) => {
        const material = materialStore.materials.find(
          (m) => m.id === recipe.material_id
        );
        return (
          acc +
          (material?.cost_per_unit || 0) *
            recipe.quantity_per_product *
            (Number(data.quantity_produced) || 0)
        );
      }, 0);

      const { data: newProduction, error } = await supabase
        .from('production_logs')
        .insert({ ...data, total_cost: totalCost })
        .select('*, products(name)');

      if (error) {
        throw error;
      }

      for (const recipe of recipes) {
        const material = materialStore.materials.find(
          (m) => m.id === recipe.material_id
        );
        if (material) {
          const cantidadUsada =
            recipe.quantity_per_product * (Number(data.quantity_produced) || 0);
          await materialStore.updateMaterial(material.id, {
            stock_quantity: material.stock_quantity - cantidadUsada,
          });
        }
      }

      const newProductStock =
        selectedProduct.stock_quantity + Number(data.quantity_produced);
      await productStore.updateProduct(selectedProduct.id, {
        stock_quantity: newProductStock,
      });

      set((state) => ({
        productionLogs: [...state.productionLogs, newProduction[0]],
      }));
      
    } catch (error) {
      set({ error: "Error adding production log" });
    }
  },

  updateProductionLog: async (id, data) => {
    const productStore = useProductStore.getState();
    const materialStore = useMaterialStore.getState();
    const recipeStore = useRecipeStore.getState();

    try {
      const { data: currentLog, error: fetchError } = await supabase
        .from("production_logs")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !currentLog) throw new Error("Registro de producción no encontrado");

      const selectedProduct = productStore.products.find(
        (p) => p.id === currentLog.product_id
      );
      if (!selectedProduct) throw new Error("Producto no encontrado");

      for (const recipe of recipeStore.recipes.filter(
        (recipe) => recipe.product_id === selectedProduct.id
      )) {
        const material = materialStore.materials.find(
          (m) => m.id === recipe.material_id
        );
        if (material) {
          const cantidadUsada =
            recipe.quantity_per_product * currentLog.quantity_produced;
          await materialStore.updateMaterial(material.id, {
            stock_quantity: material.stock_quantity + cantidadUsada,
          });
        }
      }

      const totalCost =
        recipeStore.recipes
          .filter((recipe) => recipe.product_id === selectedProduct.id)
          .reduce((acc: number, recipe: Recipe) => {
            const material = materialStore.materials.find(
              (m) => m.id === recipe.material_id
            );
            return (
              acc +
              (material?.cost_per_unit || 0) *
                recipe.quantity_per_product *
                (Number(data.quantity_produced) || 0)
            );
          }, 0) || 0;

      const { data: updatedProduction, error: updateError } = await supabase
        .from("production_logs")
        .update({ ...data, total_cost: totalCost })
        .eq("id", id)
        .select();
      if (updateError) throw updateError;

      for (const recipe of recipeStore.recipes.filter(
        (recipe) => recipe.product_id === selectedProduct.id
      )) {
        const material = materialStore.materials.find(
          (m) => m.id === recipe.material_id
        );
        if (material) {
          const cantidadUsada =
            recipe.quantity_per_product * (Number(data.quantity_produced) || 0);
          await materialStore.updateMaterial(material.id, {
            stock_quantity: material.stock_quantity - cantidadUsada,
          });
        }
      }

      const newProductStock =
        selectedProduct.stock_quantity -
        currentLog.quantity_produced +
        Number(data.quantity_produced);
      await productStore.updateProduct(selectedProduct.id, {
        stock_quantity: newProductStock,
      });

      set((state) => ({
        productionLogs: state.productionLogs.map((log) =>
          log.id === id ? updatedProduction[0] : log
        ),
      }));
    } catch (error) {
      set({ error: "Error updating production log" });
    }
  },

  deleteProductionLog: async (id) => {
    try {
      const productStore = useProductStore.getState();
      const materialStore = useMaterialStore.getState();
      const recipeStore = useRecipeStore.getState();

      const { data: logToDelete, error: fetchError } = await supabase
        .from("production_logs")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !logToDelete) throw new Error("Registro de producción no encontrado");

      const selectedProduct = productStore.products.find(
        (p) => p.id === logToDelete.product_id
      );
      if (!selectedProduct) throw new Error("Producto no encontrado");

      for (const recipe of recipeStore.recipes.filter(
        (recipe) => recipe.product_id === selectedProduct.id
      )) {
        const material = materialStore.materials.find(
          (m) => m.id === recipe.material_id
        );
        if (material) {
          const cantidadUsada =
            recipe.quantity_per_product * logToDelete.quantity_produced;
          await materialStore.updateMaterial(material.id, {
            stock_quantity: material.stock_quantity + cantidadUsada,
          });
        }
      }

      const newProductStock =
        selectedProduct.stock_quantity - logToDelete.quantity_produced;
      await productStore.updateProduct(selectedProduct.id, {
        stock_quantity: newProductStock,
      });

      const { error: deleteError } = await supabase
        .from("production_logs")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;

      set((state) => ({
        productionLogs: state.productionLogs.filter((log) => log.id !== id),
      }));
    } catch (error) {
      set({ error: "Error deleting production log" });
    }
  },
}));
