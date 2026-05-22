<script setup lang="ts">
import {
  Html,
  Body,
  Container,
  Section,
  Text,
  Button,
  Preview,
  Tailwind,
  Img,
  Row,
  Column,
  Hr,
} from "@vue-email/components";
import tailwindConfig from "./tailwind.config";

defineProps({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  registrationId: { type: String, required: true },
  orderNumber: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  vatRate: { type: Number, default: 0 },
  subtotalHt: { type: Number, required: true },
  vatAmount: { type: Number, default: 0 },
  appUrl: { type: String, default: "http://localhost:3000" },
});

const dateStr = new Date().toLocaleDateString("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
</script>

<template>
  <Html lang="fr">
    <Preview>Nouvelle inscription ACD — {{ firstName }} {{ lastName }}</Preview>
    <Tailwind :config="tailwindConfig">
      <Body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Inter', system-ui, sans-serif;">
        <Section style="padding: 40px 20px; background-color: #f6f9fc;">
        <Container class="max-w-xl mx-auto">
          <!-- HEADER -->
          <Section
            class="bg-white px-10 pt-8 pb-6 rounded-t-2xl"
            style="border: 1px solid #e4e4e4; border-bottom: none"
          >
            <Row>
              <Column>
                <Img
                  src="cid:acd-logo"
                  alt="ACD Logo"
                  width="90"
                  height="36"
                  class="block"
                />
              </Column>
              <Column align="right" style="vertical-align: top">
                <Text
                  class="text-foreground m-0 mb-1"
                  style="
                    font-size: 20px;
                    font-weight: 300;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    text-align: right;
                    line-height: 1.2;
                  "
                >
                  Notification
                </Text>
                <Text
                  class="text-xs text-muted-foreground m-0"
                  style="text-align: right"
                >
                  {{ dateStr }}
                </Text>
              </Column>
            </Row>
          </Section>

          <!-- CONTENT -->
          <Section
            class="bg-white px-10 py-6"
            style="border-left: 1px solid #e4e4e4; border-right: 1px solid #e4e4e4"
          >
            <Hr class="border-border m-0 mb-6" />
            <Text class="text-sm text-foreground m-0 mb-4">
              Une nouvelle inscription a été enregistrée sur le site ACD.
            </Text>

            <!-- Details -->
            <Section
              class="rounded-2xl px-6 py-4 mb-4"
              style="background-color: #f9fafb; border: 1px solid #e4e4e4"
            >
              <Text
                class="text-xs text-muted-foreground m-0 mb-3"
                style="text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600"
              >
                Détails de l'inscription
              </Text>

              <Row style="border-bottom: 1px solid #e5e7eb">
                <Column class="py-2">
                  <Text class="text-xs text-muted-foreground m-0">Nom</Text>
                </Column>
                <Column align="right" class="py-2">
                  <Text class="text-sm font-semibold text-foreground m-0">
                    {{ firstName }} {{ lastName }}
                  </Text>
                </Column>
              </Row>

              <Row style="border-bottom: 1px solid #e5e7eb">
                <Column class="py-2">
                  <Text class="text-xs text-muted-foreground m-0">Email</Text>
                </Column>
                <Column align="right" class="py-2">
                  <Text class="text-sm font-semibold text-foreground m-0">
                    {{ email }}
                  </Text>
                </Column>
              </Row>

              <Row style="border-bottom: 1px solid #e5e7eb">
                <Column class="py-2">
                  <Text class="text-xs text-muted-foreground m-0">N° d'inscription</Text>
                </Column>
                <Column align="right" class="py-2">
                  <Text class="text-sm font-semibold text-foreground m-0">
                    {{ registrationId }}
                  </Text>
                </Column>
              </Row>

              <Row style="border-bottom: 1px solid #e5e7eb">
                <Column class="py-2">
                  <Text class="text-xs text-muted-foreground m-0">N° de paiement</Text>
                </Column>
                <Column align="right" class="py-2">
                  <Text class="text-sm font-semibold text-foreground m-0">
                    {{ orderNumber }}
                  </Text>
                </Column>
              </Row>

              <Row style="border-bottom: 1px solid #e5e7eb">
                <Column class="py-2">
                  <Text class="text-xs text-muted-foreground m-0">Sous-total HT</Text>
                </Column>
                <Column align="right" class="py-2">
                  <Text class="text-sm text-foreground m-0">
                    {{ subtotalHt.toFixed(2) }} €
                  </Text>
                </Column>
              </Row>

              <Row style="border-bottom: 1px solid #e5e7eb">
                <Column class="py-2">
                  <Text class="text-xs text-muted-foreground m-0">TVA ({{ vatRate }}%)</Text>
                </Column>
                <Column align="right" class="py-2">
                  <Text class="text-sm text-foreground m-0">
                    {{ vatAmount.toFixed(2) }} €
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column class="py-2">
                  <Text class="text-xs text-muted-foreground m-0">Total TTC</Text>
                </Column>
                <Column align="right" class="py-2">
                  <Text class="text-sm font-semibold text-foreground m-0">
                    {{ totalPrice.toFixed(2) }} €
                  </Text>
                </Column>
              </Row>
            </Section>

            <Text class="text-sm text-muted-foreground m-0">
              Vous pouvez consulter les détails dans le
              <a
                :href="`${appUrl}/admin/inscriptions`"
                style="color: #111827; text-decoration: underline"
              >back office</a>.
            </Text>
          </Section>

          <!-- FOOTER -->
          <Section
            class="bg-white px-10 py-6 rounded-b-2xl"
            style="border: 1px solid #e4e4e4; border-top: none"
          >
            <Hr class="border-border m-0 mb-5" />
            <Row>
              <Column>
                <Text class="text-xs text-muted m-0" style="line-height: 1.6">
                  Cet email est envoyé automatiquement. Vous recevez ce message
                  car votre adresse est configurée dans les notifications
                  d'inscription.
                </Text>
              </Column>
              <Column align="right" style="vertical-align: middle">
                <Img
                  src="cid:acd-logo"
                  alt="ACD"
                  width="44"
                  height="20"
                  style="display: block; object-fit: contain; margin-left: auto"
                />
              </Column>
            </Row>
          </Section>
        </Container>
        </Section>
      </Body>
    </Tailwind>
  </Html>
</template>
