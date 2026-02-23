import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/shared/fade-in";

const contacts = [
  { name: "Prasad Patewar", phone: "8668208147" },
  { name: "Mahesh Shendge", phone: "7387308437" },
];

export function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-border bg-card/30 py-12 px-5 text-center"
    >
      <FadeIn>
        <p className="text-sm font-bold tracking-tight mb-6">
          Solve<span className="text-muted-foreground">Flow</span>
        </p>

        <div className="flex flex-wrap justify-center gap-10">
          {contacts.map(({ name, phone }) => (
            <div key={phone} className="flex flex-col items-center gap-2">
              <p className="text-sm font-semibold">{name}</p>
              <a
                href={`https://wa.me/91${phone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#25D36633] bg-[#25D36610] text-[#25D366] font-mono font-bold text-sm hover:bg-[#25D36620] transition-colors"
              >
                <span className="text-base">💬</span>
                {phone}
              </a>
            </div>
          ))}
        </div>

        <Separator className="my-8 max-w-sm mx-auto opacity-30" />

        <p className="text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} SolveFlow · Built for coaching centers
        </p>
      </FadeIn>
    </footer>
  );
}
