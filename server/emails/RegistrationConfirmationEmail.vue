<script setup lang="ts">
import {
  Html,
  Body,
  Container,
  Section,
  Text,
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
  dessert: string | null;
}

defineProps({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  orderNumber: { type: String, required: true },
  registrationId: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  meals: { type: Array as () => MealSelection[], default: () => [] },
  activities: { type: Array as () => string[], default: () => [] },
  appUrl: { type: String, default: "http://localhost:3000" },
});

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
      <Body style="background-color: #f6f9fc; font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 40px 0;">
        <Container style="max-width: 560px; margin: 0 auto;">

          <!-- HEADER -->
          <Section style="background: #ffffff; padding: 36px 48px 28px; border: 1px solid #e5e7eb; border-radius: 16px 16px 0 0; border-bottom: none;">
            <Row>
              <Column>
                <Img
                  src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
                  alt="ACD Logo"
                  width="90"
                  height="36"
                  style="object-fit: contain; display: block;"
                />
              </Column>
              <Column align="right" style="vertical-align: top;">
                <Text style="font-size: 22px; font-weight: 300; letter-spacing: 0.06em; text-transform: uppercase; color: #111827; margin: 0 0 4px 0; line-height: 1.2; text-align: right;">
                  Inscription
                </Text>
                <Text style="font-size: 12px; color: #6b7280; margin: 0; text-align: right;">
                  {{ orderNumber }} · {{ dateStr }}
                </Text>
              </Column>
            </Row>
          </Section>

          <!-- INTRO -->
          <Section style="background: #ffffff; padding: 24px 48px 20px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
            <Hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px 0;" />
            <Text style="font-size: 14px; color: #111827; margin: 0 0 6px 0; line-height: 1.6;">
              Bonjour <strong>{{ firstName }}</strong>,
            </Text>
            <Text style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.7;">
              Votre inscription a bien été enregistrée. Vous trouverez ci-dessous le récapitulatif de votre participation ainsi que la facture en pièce jointe.
            </Text>
          </Section>

          <!-- MEALS -->
          <template v-if="meals.length > 0">
            <Section style="background: #ffffff; padding: 20px 48px 0; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
              <Hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px 0;" />
              <Text style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; font-weight: 600; margin: 0 0 12px 0;">
                Repas
              </Text>
            </Section>
            <Section
              v-for="(meal, i) in meals"
              :key="i"
              style="background: #ffffff; padding: 0 48px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;"
            >
              <Row style="border-bottom: 1px solid #f3f4f6;">
                <Column style="padding: 10px 0;">
                  <Text style="font-size: 13px; font-weight: 500; color: #111827; margin: 0 0 3px 0;">
                    {{ meal.mealName }}
                  </Text>
                  <Text
                    v-if="meal.starter || meal.main || meal.dessert"
                    style="font-size: 12px; color: #6b7280; margin: 0;"
                  >
                    {{ [meal.starter, meal.main, meal.dessert].filter(Boolean).join(" · ") }}
                  </Text>
                </Column>
              </Row>
            </Section>
          </template>

          <!-- ACTIVITIES -->
          <template v-if="activities.length > 0">
            <Section style="background: #ffffff; padding: 20px 48px 0; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
              <Hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px 0;" />
              <Text style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; font-weight: 600; margin: 0 0 12px 0;">
                Activités
              </Text>
            </Section>
            <Section
              v-for="(activity, i) in activities"
              :key="i"
              style="background: #ffffff; padding: 0 48px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;"
            >
              <Row style="border-bottom: 1px solid #f3f4f6;">
                <Column style="padding: 10px 0;">
                  <Text style="font-size: 13px; color: #111827; margin: 0;">
                    {{ activity }}
                  </Text>
                </Column>
              </Row>
            </Section>
          </template>

          <!-- TOTAL -->
          <Section style="background: #ffffff; padding: 20px 48px 28px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
            <Hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px 0;" />
            <Row>
              <Column>
                <Text style="font-size: 14px; font-weight: 600; color: #111827; margin: 0;">Total</Text>
              </Column>
              <Column align="right">
                <Text style="font-size: 14px; font-weight: 600; color: #111827; margin: 0;">{{ totalPrice.toFixed(2) }} €</Text>
              </Column>
            </Row>
          </Section>

          <!-- QR CODE -->
          <Section style="background: #ffffff; padding: 20px 48px 28px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
            <Hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 20px 0;" />
            <Text style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; font-weight: 600; margin: 0 0 16px 0;">
              QR code de présence
            </Text>
            <Row>
              <Column align="center">
                <Img
                  :src="`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${registrationId}&bgcolor=ffffff&color=111827&margin=8`"
                  alt="QR code de présence"
                  width="160"
                  height="160"
                  style="display: block; margin: 0 auto; border-radius: 8px;"
                />
              </Column>
            </Row>
            <Text style="font-size: 12px; color: #6b7280; text-align: center; margin: 12px 0 0 0; line-height: 1.6;">
              Présentez ce QR code à l'entrée de l'événement.<br />
              Il sera scanné pour valider votre présence.
            </Text>
          </Section>

          <!-- FOOTER -->
          <Section style="background: #ffffff; padding: 20px 48px 28px; border: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
            <Hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 20px 0;" />
            <Row>
              <Column>
                <Text style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6;">
                  Merci pour votre participation !
                </Text>
                <Text style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">
                  © {{ new Date().getFullYear() }} ACD MMI
                </Text>
              </Column>
              <Column align="right" style="vertical-align: middle;">
                <Img
                  src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
                  alt="ACD"
                  width="44"
                  height="20"
                  style="object-fit: contain; display: block; margin-left: auto;"
                />
              </Column>
            </Row>
          </Section>

        </Container>
      </Body>
    </Tailwind>
  </Html>
</template>
