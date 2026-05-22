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

interface MealSelection {
  mealName: string;
  starter: string | null;
  main: string | null;
  cheese: string | null;
  dessert: string | null;
  price: number;
}

interface ActivitySelection {
  name: string;
  price: number;
}

defineProps({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  orderNumber: { type: String, required: true },
  registrationId: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  vatRate: { type: Number, default: 0 },
  subtotalHt: { type: Number, required: true },
  vatAmount: { type: Number, default: 0 },
  meals: { type: Array as () => MealSelection[], default: () => [] },
  activities: { type: Array as () => ActivitySelection[], default: () => [] },
  appUrl: { type: String, default: "http://localhost:3000" },
});

function formatPrice(price: number): string {
  return price > 0 ? `${price.toFixed(2)} €` : "Gratuit";
}

const dateStr = new Date().toLocaleDateString("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
</script>

<template>
  <Html lang="fr">
    <Preview>Confirmation d'inscription ACD — {{ orderNumber }}</Preview>
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
                  Inscription
                </Text>
                <Text
                  class="text-xs text-muted-foreground m-0"
                  style="text-align: right"
                >
                  {{ orderNumber }} · {{ dateStr }}
                </Text>
              </Column>
            </Row>
          </Section>

          <!-- INTRO -->
          <Section
            class="bg-white px-10 py-6"
            style="border-left: 1px solid #e4e4e4; border-right: 1px solid #e4e4e4"
          >
            <Hr class="border-border m-0 mb-6" />
            <Text class="text-sm text-foreground m-0 mb-2">
              Bonjour <strong>{{ firstName }}</strong>,
            </Text>
            <Text class="text-sm text-muted-foreground m-0">
              Votre inscription a bien été enregistrée. Vous trouverez
              ci-dessous le récapitulatif de votre participation ainsi que la
              facture en pièce jointe.
            </Text>
          </Section>

          <!-- MEALS -->
          <template v-if="meals.length > 0">
            <Section
              class="bg-white px-10 pt-5"
              style="border-left: 1px solid #e4e4e4; border-right: 1px solid #e4e4e4"
            >
              <Hr class="border-border m-0 mb-4" />
              <Text
                class="text-xs text-muted-foreground m-0 mb-3"
                style="text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600"
              >
                Repas
              </Text>
            </Section>
            <Section
              v-for="(meal, i) in meals"
              :key="i"
              class="bg-white px-10"
              style="border-left: 1px solid #e4e4e4; border-right: 1px solid #e4e4e4"
            >
              <Row style="border-bottom: 1px solid #f3f4f6">
                <Column class="py-2">
                  <Text class="text-sm font-semibold text-foreground m-0 mb-1">
                    {{ meal.mealName }}
                  </Text>
                  <Text
                    v-if="meal.starter || meal.main || meal.cheese || meal.dessert"
                    class="text-xs text-muted-foreground m-0"
                  >
                    {{ [meal.starter, meal.main, meal.cheese, meal.dessert].filter(Boolean).join(" · ") }}
                  </Text>
                </Column>
                <Column align="right" class="py-2" style="vertical-align: top; white-space: nowrap;">
                  <Text class="text-sm font-semibold text-foreground m-0">
                    {{ formatPrice(meal.price) }}
                  </Text>
                </Column>
              </Row>
            </Section>
          </template>

          <!-- ACTIVITIES -->
          <template v-if="activities.length > 0">
            <Section
              class="bg-white px-10 pt-5"
              style="border-left: 1px solid #e4e4e4; border-right: 1px solid #e4e4e4"
            >
              <Hr class="border-border m-0 mb-4" />
              <Text
                class="text-xs text-muted-foreground m-0 mb-3"
                style="text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600"
              >
                Activités
              </Text>
            </Section>
            <Section
              v-for="(activity, i) in activities"
              :key="i"
              class="bg-white px-10"
              style="border-left: 1px solid #e4e4e4; border-right: 1px solid #e4e4e4"
            >
              <Row style="border-bottom: 1px solid #f3f4f6">
                <Column class="py-2">
                  <Text class="text-sm text-foreground m-0">{{ activity.name }}</Text>
                </Column>
                <Column align="right" class="py-2" style="vertical-align: top; white-space: nowrap;">
                  <Text class="text-sm font-semibold text-foreground m-0">
                    {{ formatPrice(activity.price) }}
                  </Text>
                </Column>
              </Row>
            </Section>
          </template>

          <!-- TOTAL -->
          <Section
            class="bg-white px-10 py-6"
            style="border-left: 1px solid #e4e4e4; border-right: 1px solid #e4e4e4"
          >
            <Hr class="border-border m-0 mb-4" />
            <Row>
              <Column class="py-1">
                <Text class="text-sm text-muted-foreground m-0">Sous-total HT</Text>
              </Column>
              <Column align="right" class="py-1">
                <Text class="text-sm text-muted-foreground m-0">
                  {{ subtotalHt.toFixed(2) }} €
                </Text>
              </Column>
            </Row>
            <Row>
              <Column class="py-1">
                <Text class="text-sm text-muted-foreground m-0">TVA ({{ vatRate }}%)</Text>
              </Column>
              <Column align="right" class="py-1">
                <Text class="text-sm text-muted-foreground m-0">
                  {{ vatAmount.toFixed(2) }} €
                </Text>
              </Column>
            </Row>
            <Hr class="border-border m-0 my-2" />
            <Row>
              <Column>
                <Text class="text-sm font-semibold text-foreground m-0">Total TTC</Text>
              </Column>
              <Column align="right">
                <Text class="text-sm font-semibold text-foreground m-0">
                  {{ totalPrice.toFixed(2) }} €
                </Text>
              </Column>
            </Row>
          </Section>

          <!-- QR CODE -->
          <Section
            class="bg-white px-10 py-6"
            style="border-left: 1px solid #e4e4e4; border-right: 1px solid #e4e4e4"
          >
            <Hr class="border-border m-0 mb-5" />
            <Text
              class="text-xs text-muted-foreground m-0 mb-4"
              style="text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600"
            >
              QR code de présence
            </Text>
            <Row>
              <Column align="center">
                <Img
                  src="cid:acd-qr"
                  alt="QR code de présence"
                  width="160"
                  height="160"
                  style="display: block; margin: 0 auto; border-radius: 8px"
                />
              </Column>
            </Row>
            <Text
              class="text-xs text-muted-foreground m-0 mt-3"
              style="text-align: center; line-height: 1.6"
            >
              Présentez ce QR code à l'entrée de l'événement.<br />
              Il sera scanné pour valider votre présence.
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
                <Text class="text-sm text-muted-foreground m-0 mb-1">
                  Merci pour votre participation !
                </Text>
                <Text class="text-xs text-muted m-0">
                  © {{ new Date().getFullYear() }} ACD MMI
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
