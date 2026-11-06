import { Menu } from "@base-ui/react/menu"
import {
  Braces,
  ChevronDown,
  FileJson,
  Fingerprint,
  KeyRound,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSamplePayloads, type SamplePayload } from "@/data/sample-payloads"

interface SamplePayloadsMenuProps {
  onSelect: (sample: SamplePayload) => void
}

/** Pick an icon from the sample id prefix so each ceremony type is recognisable. */
function sampleIcon(id: string): LucideIcon {
  if (id.startsWith("registration")) return KeyRound
  if (id.startsWith("assertion")) return Fingerprint
  if (id.startsWith("clientdata")) return FileJson
  return Braces
}

export function SamplePayloadsMenu({ onSelect }: SamplePayloadsMenuProps) {
  const samples = getSamplePayloads()

  return (
    <Menu.Root>
      <Menu.Trigger
        render={(props) => (
          <Button
            variant="outline"
            size="sm"
            aria-label="Load sample payload"
            className="gap-1.5"
            {...props}
          >
            <Sparkles className="size-3.5 text-primary" />
            Load sample
            <ChevronDown className="size-3.5 opacity-70 transition-transform group-aria-expanded/button:rotate-180" />
          </Button>
        )}
      />
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="end" className="z-50">
          <Menu.Popup className="min-w-[300px] max-w-[380px] origin-(--transform-origin) rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl shadow-black/40 outline-none transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <Menu.Group>
              <Menu.GroupLabel className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Sample payloads
              </Menu.GroupLabel>
              {samples.map((sample) => {
                const Icon = sampleIcon(sample.id)
                return (
                  <Menu.Item
                    key={sample.id}
                    onClick={() => onSelect(sample)}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground"
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="leading-tight font-medium">{sample.label}</span>
                      <span className="text-xs leading-snug text-muted-foreground">
                        {sample.description}
                      </span>
                    </span>
                  </Menu.Item>
                )
              })}
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
