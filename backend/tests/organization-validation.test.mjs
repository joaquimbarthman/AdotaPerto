import test from "node:test";
import assert from "node:assert/strict";
import { isValidCnpj, organizationSlug } from "../src/services/organization-validation.ts";

test("valida os dígitos do CNPJ e rejeita sequências", () => {
  assert.equal(isValidCnpj("11222333000181"), true);
  assert.equal(isValidCnpj("11222333000182"), false);
  assert.equal(isValidCnpj("00000000000000"), false);
});

test("gera slug público estável e sem acentos", () => {
  assert.equal(organizationSlug("  Patinhas Felizes — São Paulo  "), "patinhas-felizes-sao-paulo");
});
