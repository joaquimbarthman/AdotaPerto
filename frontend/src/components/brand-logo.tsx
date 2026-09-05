import Image from "next/image";

export function BrandLogo({ className, priority = false }: { className: string; priority?: boolean }) {
  return (
    <>
      <Image src="/images/adotaperto-logo-v2.png" alt="AdotaPerto" width={2160} height={500} priority={priority} className={`brand-logo-light ${className}`} />
      <Image src="/images/adotaperto-logo-dark.png" alt="AdotaPerto" width={2172} height={724} priority={priority} className={`brand-logo-dark ${className}`} />
    </>
  );
}
