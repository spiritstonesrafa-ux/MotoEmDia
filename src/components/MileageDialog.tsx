import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Gauge } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { km, type Moto } from "@/lib/moto";

export function MileageDialog({ moto }: { moto: Moto }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = Number(new FormData(e.currentTarget).get("km"));
    if (!Number.isInteger(value) || value < 0) { toast.error("Informe um número válido"); return; }
    if (value < moto.current_mileage) { toast.error(`Não pode ser menor que ${km(moto.current_mileage)}`); return; }
    if (value === moto.current_mileage) return setOpen(false);
    setSaving(true);
    const { error } = await supabase.from("motorcycles").update({ current_mileage: value }).eq("id", moto.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Quilometragem atualizada");
    qc.invalidateQueries({ queryKey: ["moto"] });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="h-11"><Gauge className="mr-1 h-4 w-4" /> Atualizar quilometragem</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Atualizar quilometragem</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">Atual: {km(moto.current_mileage)}</p>
          <div className="space-y-1.5">
            <Label htmlFor="km">Nova quilometragem</Label>
            <Input id="km" name="km" type="number" inputMode="numeric" min={moto.current_mileage} defaultValue={moto.current_mileage} required className="h-11" />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
