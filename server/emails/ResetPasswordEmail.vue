<script setup lang="ts">
import {
  Html,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Preview,
  Tailwind,
  Img,
  Row,
  Column,
} from "@vue-email/components";
import tailwindConfig from "./tailwind.config";

defineProps({
  url: String,
  email: String,
  name: {
    type: String,
    default: "",
  },
  appUrl: {
    type: String,
    default: "http://localhost:3000",
  },
});
</script>

<template>
  <Html lang="fr">
    <Preview>Réinitialisation de votre mot de passe - ACD</Preview>
    <Tailwind :config="tailwindConfig">
      <Body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Inter', system-ui, sans-serif;">
        <Section style="padding: 40px 20px; background-color: #f6f9fc;">
        <Container class="max-w-xl mx-auto">
          <!-- Header with Logo -->
          <Section class="px-10 py-6">
            <Row>
              <Column>
                <Img
                  src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
                  alt="ACD Logo"
                  width="64"
                  height="64"
                  class="inline-block align-middle"
                />
              </Column>
            </Row>
          </Section>

          <!-- Main Content Card -->
          <Section
            class="bg-white rounded-2xl px-10 py-8"
            style="border: 1px solid #e4e4e4"
          >
            <Heading class="text-2xl font-semibold text-foreground m-0 mb-6">
              Réinitialiser votre mot de passe
            </Heading>

            <Text class="text-md text-foreground m-0 mb-4">
              Bonjour{{ name ? ` ${name}` : "" }},
            </Text>

            <Text class="text-md text-muted-foreground m-0 mb-6">
              Nous avons reçu une demande de réinitialisation de mot de passe
              pour votre compte ACD. Cliquez sur le bouton ci-dessous pour
              choisir un nouveau mot de passe.
            </Text>

            <Section class="my-8">
              <Button
                :href="url"
                class="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-normal no-underline"
              >
                Réinitialiser mon mot de passe
              </Button>
            </Section>

            <Section
              class="rounded-2xl px-6 py-4 mb-6"
              style="border: 1px solid #e4e4e4; background-color: #f6f9fc"
            >
              <Text class="text-sm font-semibold text-foreground m-0 mb-2">
                Ce lien expire dans 1 heure
              </Text>
              <Text class="text-sm text-muted-foreground m-0">
                Pour des raisons de sécurité, ce lien de réinitialisation n'est
                valide que pendant une heure. Passé ce délai, vous devrez
                effectuer une nouvelle demande.
              </Text>
            </Section>

            <Text class="text-sm text-muted-foreground m-0 mb-6">
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez
              ignorer cet email en toute sécurité. Votre mot de passe actuel
              restera inchangé.
            </Text>

            <Text class="text-md text-muted-foreground m-0">
              Cordialement,
            </Text>
            <Text class="text-md font-semibold text-foreground m-0">
              L'équipe ACD
            </Text>
          </Section>

          <!-- Footer -->
          <Section class="py-6 px-10">
            <Text class="text-xs text-muted text-left m-0 mb-6">
              Cet email a été envoyé à {{ email }}. Si vous préférez ne plus
              recevoir ce type d'email, vous pouvez gérer vos préférences.
            </Text>

            <Row>
              <Column>
                <Text class="text-xs text-muted text-left m-0 mb-6">
                  &copy; {{ new Date().getFullYear() }} ACD. Tous droits
                  réservés.
                </Text>
              </Column>
              <Column align="center">
                <Img
                  src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
                  alt="ACD Logo"
                  width="48"
                  height="48"
                  class="inline-block align-left"
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
