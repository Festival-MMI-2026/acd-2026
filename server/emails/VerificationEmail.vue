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
    <Preview>Vérifiez votre adresse email - ACD</Preview>
    <Tailwind :config="tailwindConfig">
      <Body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Inter', system-ui, sans-serif;">
        <Section style="padding: 40px 20px; background-color: #f6f9fc;">
        <Container class="max-w-xl mx-auto">
          <!-- Header with Logo -->
          <Section class="px-10 py-6">
            <Row>
              <Column>
                <Img
                  src="cid:acd-logo"
                  alt="ACD Logo"
                  width="120"
                  height="52"
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
              Vérifiez votre adresse email
            </Heading>

            <Text class="text-md text-foreground m-0 mb-4">
              Bonjour{{ name ? ` ${name}` : "" }},
            </Text>

            <Text class="text-md text-muted-foreground m-0 mb-6">
              Merci pour votre inscription sur la plateforme ACD. Pour activer
              votre compte, veuillez confirmer votre adresse email en cliquant
              sur le bouton ci-dessous.
            </Text>

            <Section class="my-8">
              <Button
                :href="url"
                class="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-normal no-underline"
              >
                Vérifier mon adresse email
              </Button>
            </Section>

            <Section
              class="rounded-2xl px-6 py-4 mb-6"
              style="border: 1px solid #e4e4e4; background-color: #f6f9fc"
            >
              <Text class="text-sm font-semibold text-foreground m-0 mb-2">
                Finalisez votre profil
              </Text>
              <Text class="text-sm text-muted-foreground m-0">
                Une fois votre email vérifié, pensez à compléter votre profil en
                ajoutant votre numéro de téléphone et en sélectionnant votre
                IUT. Rendez-vous sur votre page
                <a
                  :href="`${appUrl}/profil`"
                  style="color: #000000; text-decoration: underline"
                >
                  Mon Profil
                </a>
                pour finaliser votre inscription.
              </Text>
            </Section>

            <Text class="text-sm text-muted-foreground m-0 mb-6">
              Si vous n'avez pas créé de compte, vous pouvez ignorer cet email
              en toute sécurité.
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
                  src="cid:acd-logo"
                  alt="ACD Logo"
                  width="44"
                  height="20"
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
