import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { ProductionLog } from "@/types";
import { useProductStore } from "./productStore";
import { useMaterialStore } from "./materialStore";
import { useRecipeStore } from "./recipeStore";

// Asegúrate de que Recipe esté definido o importado
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

  // Fetch logs de producción
  fetchProductionLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("production_logs")
        .select("*");

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Fetched production logs:", data);

      set({ productionLogs: data || [], isLoading: false });
    } catch (error) {
      console.error("Error fetching production logs:", error);
      set({ error: "Error fetching production logs", isLoading: false });
    }
  },

  // Añadir un nuevo registro de producción
  addProductionLog: async (data) => {
    const productStore = useProductStore.getState();
    const materialStore = useMaterialStore.getState();
    const recipeStore = useRecipeStore.getState();

    try {
      console.log("Data received for new production log:", data);
      console.log("Available products:", productStore.products);

      // Validar si el producto existe
      const selectedProduct = productStore.products.find(
        (p) => Number(p.id) === Number(data.product_id)
      );
      console.log("Selected product:", selectedProduct);
      if (!selectedProduct) throw new Error("Producto no encontrado");

      // Obtener las recetas del producto
      const recipes = recipeStore.recipes.filter(
        (recipe) => recipe.product_id === selectedProduct.id
      );
      console.log("Recipes of selected product:", recipes);
      if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
        throw new Error("El producto no tiene recetas asociadas");
      }

      // Calcular costo total de producción
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

      console.log("Total cost calculated:", totalCost);

      // Registrar la producción en la tabla 'production_logs'
      const { data: newProduction, error } = await supabase
        .from('production_logs')
        .insert({ ...data, total_cost: totalCost })
        .select('*, products(name)');

      if (error) {
        console.error("Error inserting production log:", error);
        throw error;
      }

      console.log("New production log created:", newProduction);

      // Descontar materiales utilizados
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

      // Actualizar stock del producto
      const newProductStock =
        selectedProduct.stock_quantity + Number(data.quantity_produced);
      await productStore.updateProduct(selectedProduct.id, {
        stock_quantity: newProductStock,
      });

      // Actualizar el estado de producción
      set((state) => {
        console.log(
          "Updating state with new production log:",
          newProduction[0]
        );
        return {
          productionLogs: [...state.productionLogs, newProduction[0]],
        };
      });
      
    } catch (error) {
      console.error("Error adding production log:", error);
      set({ error: "Error adding production log" });
    }
  },

  // Actualizar un registro de producción existente
  updateProductionLog: async (id, data) => {
    const productStore = useProductStore.getState();
    const materialStore = useMaterialStore.getState();
    const recipeStore = useRecipeStore.getState();

    try {
      // Obtener el registro de producción existente
      const { data: currentLog, error: fetchError } = await supabase
        .from("production_logs")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !currentLog) throw new Error("Registro de producción no encontrado");

      // Obtener el producto seleccionado
      const selectedProduct = productStore.products.find(
        (p) => p.id === currentLog.product_id
      );
      if (!selectedProduct) throw new Error("Producto no encontrado");

      // Restaurar los materiales utilizados previamente (volver a sumarlos al stock)
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

      // Calcular nuevo costo total de producción con los datos actualizados
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

      // Actualizar el registro de producción
      const { data: updatedProduction, error: updateError } = await supabase
        .from("production_logs")
        .update({ ...data, total_cost: totalCost })
        .eq("id", id)
        .select();
      if (updateError) throw updateError;

      // Descontar nuevamente los materiales actualizados
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

      // Actualizar el stock del producto con la nueva cantidad producida
      const newProductStock =
        selectedProduct.stock_quantity -
        currentLog.quantity_produced +
        Number(data.quantity_produced);
      await productStore.updateProduct(selectedProduct.id, {
        stock_quantity: newProductStock,
      });

      // Actualizar el estado de producción
      set((state) => ({
        productionLogs: state.productionLogs.map((log) =>
          log.id === id ? updatedProduction[0] : log
        ),
      }));
    } catch (error) {
      console.error("Error updating production log:", error);
      set({ error: "Error updating production log" });
    }
  },

  // Eliminar un registro de producción
  deleteProductionLog: async (id) => {
    try {
      const productStore = useProductStore.getState();
      const materialStore = useMaterialStore.getState();
      const recipeStore = useRecipeStore.getState();

      // Obtener el log de producción antes de eliminarlo
      const { data: logToDelete, error: fetchError } = await supabase
        .from("production_logs")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !logToDelete) throw new Error("Registro de producción no encontrado");

      // Obtener el producto relacionado
      const selectedProduct = productStore.products.find(
        (p) => p.id === logToDelete.product_id
      );
      if (!selectedProduct) throw new Error("Producto no encontrado");

      // Restaurar los materiales utilizados (sumarlos al stock)
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

      // Reducir el stock del producto
      const newProductStock =
        selectedProduct.stock_quantity - logToDelete.quantity_produced;
      await productStore.updateProduct(selectedProduct.id, {
        stock_quantity: newProductStock,
      });

      // Eliminar el log de producción
      const { error: deleteError } = await supabase
        .from("production_logs")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;

      set((state) => ({
        productionLogs: state.productionLogs.filter((log) => log.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting production log:", error);
      set({ error: "Error deleting production log" });
    }
  },
}));
