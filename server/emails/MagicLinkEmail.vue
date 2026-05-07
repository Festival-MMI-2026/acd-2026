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
  name: { type: String, default: "" },
  appUrl: { type: String, default: "http://localhost:3000" },
});
</script>

<template>
  <Html lang="fr">
    <Preview>Votre lien de connexion ACD</Preview>
    <Tailwind :config="tailwindConfig">
      <Body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Inter', system-ui, sans-serif;">
        <!-- Wrapper qui porte le padding (survit à Roundcube qui strip le body) -->
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
                Accédez à votre compte ACD
              </Heading>

              <Text class="text-base text-foreground m-0 mb-4">
                Bonjour{{ name ? ` ${name}` : "" }},
              </Text>

              <Text class="text-base text-muted-foreground m-0 mb-6">
                Cliquez sur le bouton ci-dessous pour accéder à votre compte ACD.
                Ce lien est valide pendant 5 minutes.
              </Text>

              <Section class="my-8">
                <Button
                  :href="url"
                  class="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-normal no-underline"
                >
                  Accéder à mon compte
                </Button>
              </Section>

              <Text class="text-sm text-muted-foreground m-0 mb-6">
                Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email
                en toute sécurité.
              </Text>

              <Text class="text-base text-muted-foreground m-0">Cordialement,</Text>
              <Text class="text-base font-semibold text-foreground m-0">L'équipe ACD</Text>
            </Section>

            <!-- Footer -->
            <Section class="py-6 px-10">
              <Text class="text-xs text-muted text-left m-0 mb-6">
                Cet email a été envoyé à {{ email }}.
              </Text>
              <Row>
                <Column>
                  <Text class="text-xs text-muted text-left m-0">
                    © {{ new Date().getFullYear() }} ACD. Tous droits réservés.
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
