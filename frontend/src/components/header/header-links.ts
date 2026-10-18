export const links = [
  { label: "Início", href: "/" },
  { label: "Explorar", href: "/adocao" },
  { label: "Ajudar", href: "/doacoes" },
  { label: "Mapa", href: "/mapa" },
] as const;

export const profileLinks = [
  { label: "Minhas publicações", href: "/perfil#publicacoes", icon: "heart" },
  { label: "Solicitações", href: "/perfil#solicitacoes", icon: "bell" },
  { label: "Favoritos", href: "/perfil#favoritos", icon: "bookmark" },
  { label: "Dados pessoais", href: "/perfil#dados", icon: "user" },
  { label: "Endereço", href: "/perfil#endereco", icon: "pin" },
  { label: "Acesso à conta", href: "/perfil#acesso", icon: "lock" },
] as const;
