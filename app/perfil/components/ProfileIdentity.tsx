import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function ProfileIdentity({ user }: { user: any }) {
  return (
    <Card className="border-none shadow-2xl overflow-hidden bg-white">
      <div className="h-24 bg-[#1e3a5f] relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4a843_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>
      <CardContent className="flex flex-col items-center -mt-12 relative z-10">
        <Avatar className="h-28 w-28 border-4 border-white shadow-2xl ring-2 ring-gray-50">
          <AvatarFallback className="bg-[#d4a843] text-[#1e3a5f] text-3xl font-black font-serif">
            {user.nombre?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center mt-6">
          <h3 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight leading-tight px-4">{user.nombre}</h3>
          <Badge className="mt-3 bg-[#1e3a5f] text-[#d4a843] border border-[#d4a843]/30 uppercase font-black text-[10px] tracking-[0.2em] px-5 py-1.5 shadow-sm">
            {user.role}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}