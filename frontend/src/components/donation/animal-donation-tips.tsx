import Image from "next/image";
import { HeartIcon, StoryIcon } from "./animal-form-parts";

export function AnimalDonationTips() {
 return (
<aside className="donation-form-tips lg:sticky lg:top-28">
            <div className="mb-3 rounded-2xl border border-[#d7e6da] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(38,51,43,0.04)]">
              <h2 className="text-lg font-bold text-[#194b30]">
                Dicas para um bom anúncio
              </h2>
              <p className="mt-1 text-sm leading-5 text-[#526057]">
                Pequenos cuidados aumentam as chances de adoção.
              </p>
            </div>
            <ul className="divide-y divide-[#e6eee8] rounded-2xl border border-[#d7e6da] bg-white px-5 text-sm leading-5 text-[#526057] shadow-[0_4px_14px_rgba(38,51,43,0.04)]">
              <li className="flex items-start gap-3 py-4">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center">
                  <Image
                    src="/icons/gallery.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 object-contain"
                  />
                </span>
                <span>
                  <strong className="mb-0.5 block text-[#253129]">
                    Boas fotos
                  </strong>
                  Use iluminação natural e mostre diferentes ângulos.
                </span>
              </li>
              <li className="flex items-start gap-3 py-4">
                <span className="mt-0.5 shrink-0 text-[#256441]">
                  <HeartIcon />
                </span>
                <span>
                  <strong className="mb-0.5 block text-[#253129]">
                    Seja honesto
                  </strong>
                  Descreva a personalidade e os cuidados reais para evitar
                  devoluções.
                </span>
              </li>
              <li className="flex items-start gap-3 py-4">
                <span className="mt-0.5 shrink-0 text-[#256441]">
                  <StoryIcon />
                </span>
                <span>
                  <strong className="mb-0.5 block text-[#253129]">
                    Conte a história
                  </strong>
                  Um relato verdadeiro cria conexão com possíveis adotantes.
                </span>
              </li>
            </ul>
          </aside>
 );
}
