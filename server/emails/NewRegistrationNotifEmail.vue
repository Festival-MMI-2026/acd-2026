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

defineProps({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  registrationId: { type: String, required: true },
  orderNumber: { type: String, required: true },
  totalPrice: { type: Number, required: true },
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
      <Body
        style="
          background-color: #f6f9fc;
          font-family: &quot;Inter&quot;, system-ui, sans-serif;
          margin: 0;
          padding: 40px 0;
        "
      >
        <Container style="max-width: 560px; margin: 0 auto">
          <!-- HEADER -->
          <Section
            style="
              background: #ffffff;
              padding: 36px 48px 28px;
              border: 1px solid #e5e7eb;
              border-radius: 16px 16px 0 0;
              border-bottom: none;
            "
          >
            <Row>
              <Column>
                <Img
                  src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
                  alt="ACD Logo"
                  width="90"
                  height="36"
                  style="object-fit: contain; display: block"
                />
              </Column>
              <Column align="right" style="vertical-align: top">
                <Text
                  style="
                    font-size: 22px;
                    font-weight: 300;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: #111827;
                    margin: 0 0 4px 0;
                    line-height: 1.2;
                    text-align: right;
                  "
                >
                  Notification
                </Text>
                <Text
                  style="
                    font-size: 12px;
                    color: #6b7280;
                    margin: 0;
                    text-align: right;
                  "
                >
                  {{ dateStr }}
                </Text>
              </Column>
            </Row>
          </Section>

          <!-- CONTENT -->
          <Section
            style="
              background: #ffffff;
              padding: 24px 48px 28px;
              border-left: 1px solid #e5e7eb;
              border-right: 1px solid #e5e7eb;
            "
          >
            <Hr
              style="
                border: none;
                border-top: 1px solid #e5e7eb;
                margin: 0 0 24px 0;
              "
            />
            <Text
              style="
                font-size: 14px;
                color: #111827;
                margin: 0 0 16px 0;
                line-height: 1.6;
              "
            >
              Une nouvelle inscription a été enregistrée sur le site ACD.
            </Text>

            <!-- Details -->
            <Section
              style="
                background: #f9fafb;
                padding: 16px 20px;
                border-radius: 12px;
                margin-bottom: 16px;
              "
            >
              <Text
                style="
                  font-size: 10px;
                  text-transform: uppercase;
                  letter-spacing: 0.06em;
                  color: #6b7280;
                  font-weight: 600;
                  margin: 0 0 12px 0;
                "
              >
                Détails de l'inscription
              </Text>
              <Row style="border-bottom: 1px solid #e5e7eb">
                <Column style="padding: 8px 0">
                  <Text style="font-size: 12px; color: #6b7280; margin: 0"
                    >Nom</Text
                  >
                </Column>
                <Column align="right" style="padding: 8px 0">
                  <Text
                    style="
                      font-size: 13px;
                      font-weight: 500;
                      color: #111827;
                      margin: 0;
                    "
                    >{{ firstName }} {{ lastName }}</Text
                  >
                </Column>
              </Row>
              <Row style="border-bottom: 1px solid #e5e7eb">
                <Column style="padding: 8px 0">
                  <Text style="font-size: 12px; color: #6b7280; margin: 0"
                    >Email</Text
                  >
                </Column>
                <Column align="right" style="padding: 8px 0">
                  <Text
                    style="
                      font-size: 13px;
                      font-weight: 500;
                      color: #111827;
                      margin: 0;
                    "
                    >{{ email }}</Text
                  >
                </Column>
              </Row>
              <Row style="border-bottom: 1px solid #e5e7eb">
                <Column style="padding: 8px 0">
                  <Text style="font-size: 12px; color: #6b7280; margin: 0"
                    >N° commande</Text
                  >
                </Column>
                <Column align="right" style="padding: 8px 0">
                  <Text
                    style="
                      font-size: 13px;
                      font-weight: 500;
                      color: #111827;
                      margin: 0;
                    "
                    >{{ orderNumber }}</Text
                  >
                </Column>
              </Row>
              <Row>
                <Column style="padding: 8px 0">
                  <Text style="font-size: 12px; color: #6b7280; margin: 0"
                    >Montant</Text
                  >
                </Column>
                <Column align="right" style="padding: 8px 0">
                  <Text
                    style="
                      font-size: 13px;
                      font-weight: 600;
                      color: #111827;
                      margin: 0;
                    "
                    >{{ totalPrice.toFixed(2) }} €</Text
                  >
                </Column>
              </Row>
            </Section>

            <Text
              style="
                font-size: 13px;
                color: #6b7280;
                margin: 0;
                line-height: 1.7;
              "
            >
              Vous pouvez consulter les détails dans le
              <a
                :href="`${appUrl}/admin/inscriptions`"
                style="color: #2563eb; text-decoration: underline"
                >back office</a
              >.
            </Text>
          </Section>

          <!-- FOOTER -->
          <Section
            style="
              background: #ffffff;
              padding: 20px 48px 28px;
              border: 1px solid #e5e7eb;
              border-radius: 0 0 16px 16px;
              border-top: 1px solid #e5e7eb;
            "
          >
            <Hr
              style="
                border: none;
                border-top: 1px solid #e5e7eb;
                margin: 0 0 20px 0;
              "
            />
            <Row>
              <Column>
                <Text style="font-size: 11px; color: #9ca3af; margin: 0">
                  Cet email est envoyé automatiquement. Vous recevez ce message
                  car votre adresse est configurée dans les notifications
                  d'inscription.
                </Text>
              </Column>
              <Column align="right" style="vertical-align: middle">
                <Img
                  src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
                  alt="ACD"
                  width="44"
                  height="20"
                  style="object-fit: contain; display: block; margin-left: auto"
                />
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
</template>
