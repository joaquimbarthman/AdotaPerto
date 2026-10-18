import { DonationTip } from "./item-form-parts";

export function ItemDonationTips() {
 return (
<aside className="donation-form-tips lg:sticky lg:top-28">
            <div className="mb-3 rounded-2xl border border-[#d7e6da] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(38,51,43,0.04)]">
              <h2 className="text-lg font-bold text-[#194b30]">
                Dicas para uma boa doação
              </h2>
              <p className="mt-1 text-sm leading-5 text-[#526057]">
                Informações claras ajudam o item a chegar mais rápido a quem
                precisa.
              </p>
            </div>
            <ul className="divide-y divide-[#e6eee8] rounded-2xl border border-[#d7e6da] bg-white px-5 text-sm leading-5 text-[#526057] shadow-[0_4px_14px_rgba(38,51,43,0.04)]">
              <DonationTip icon="/icons/gallery.svg" title="Use fotos reais">
                Fotografe o item em um ambiente claro e mostre a embalagem e o
                estado de conservação.
              </DonationTip>
              <DonationTip
                icon="/icons/check-detail.svg"
                title="Descreva com transparência"
              >
                Informe se o produto está aberto, usado ou possui alguma marca
                de uso.
              </DonationTip>
              <DonationTip icon="/icons/date.svg" title="Confira a validade">
                Para alimentos e produtos de higiene, verifique a data antes de
                publicar.
              </DonationTip>
            </ul>
          </aside>
 );
}
