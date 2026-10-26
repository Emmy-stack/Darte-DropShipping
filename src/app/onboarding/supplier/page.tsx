import { redirect } from "next/navigation";

export default function SupplierOnboardingRedirect() {
  redirect("/supplier/register");
}
