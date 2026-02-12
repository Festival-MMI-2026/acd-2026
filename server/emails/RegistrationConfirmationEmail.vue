<script setup lang="ts">
import {
  Html,
  Body,
  Container,
  Section,
  Heading,
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
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  meals: {
    type: Array as () => MealSelection[],
    default: () => [],
  },
  activities: {
    type: Array as () => string[],
    default: () => [],
  },
  appUrl: {
    type: String,
    default: "http://localhost:3000",
  },
});
</script>

<template>
  <Html lang="fr">
    <Preview>Confirmation de votre inscription ACD - {{ orderNumber }}</Preview>
    <Tailwind :config="tailwindConfig">
      <Body class="bg-background py-10 font-sans">
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
                <Text
                  class="inline-block align-middle text-xl font-bold text-foreground m-0 ml-2"
                >
                  ACD
                </Text>
              </Column>
            </Row>
          </Section>

          <!-- Main Content Card -->
          <Section
            class="bg-white rounded-2xl px-10 py-8"
            style="border: 1px solid #e4e4e4"
          >
            <Heading class="text-2xl font-semibold text-foreground m-0 mb-6">
              Merci pour votre inscription !
            </Heading>

            <Text class="text-md text-foreground m-0 mb-4">
              Bonjour {{ firstName }},
            </Text>

            <Text class="text-md text-muted-foreground m-0 mb-6">
              Votre inscription a bien été enregistrée. Voici le récapitulatif
              de votre réservation.
            </Text>

            <!-- Order Number -->
            <Section
              class="bg-background rounded-2xl px-6 py-4 mb-6"
              style="border: 1px solid #e4e4e4"
            >
              <Text class="text-sm text-muted-foreground m-0">
                Numéro de commande
              </Text>
              <Text class="text-lg font-semibold text-foreground m-0">
                {{ orderNumber }}
              </Text>
            </Section>

            <!-- Personal Info -->
            <Text class="text-sm font-semibold text-foreground m-0 mb-3">
              Informations personnelles
            </Text>
            <Text class="text-sm text-muted-foreground m-0 mb-1">
              {{ firstName }} {{ lastName }}
            </Text>
            <Hr class="border-border my-6" />

            <!-- Meals -->
            <template v-if="meals.length > 0">
              <Text class="text-sm font-semibold text-foreground m-0 mb-3">
                Repas sélectionnés
              </Text>
              <Section
                v-for="(meal, index) in meals"
                :key="index"
                class="bg-background rounded-2xl px-6 py-4 mb-3"
                style="border: 1px solid #e4e4e4"
              >
                <Text class="text-sm font-semibold text-foreground m-0 mb-2">
                  {{ meal.mealName }}
                </Text>
                <Text
                  v-if="meal.starter"
                  class="text-sm text-muted-foreground m-0 mb-1"
                >
                  Entrée : {{ meal.starter }}
                </Text>
                <Text
                  v-if="meal.main"
                  class="text-sm text-muted-foreground m-0 mb-1"
                >
                  Plat : {{ meal.main }}
                </Text>
                <Text
                  v-if="meal.dessert"
                  class="text-sm text-muted-foreground m-0"
                >
                  Dessert : {{ meal.dessert }}
                </Text>
              </Section>
              <Hr class="border-border my-6" />
            </template>

            <!-- Activities -->
            <template v-if="activities.length > 0">
              <Text class="text-sm font-semibold text-foreground m-0 mb-3">
                Activités sélectionnées
              </Text>
              <Text
                v-for="(activity, index) in activities"
                :key="index"
                class="text-sm text-muted-foreground m-0 mb-1"
              >
                &bull; {{ activity }}
              </Text>
              <Hr class="border-border my-6" />
            </template>

            <!-- Total -->
            <Section
              class="bg-background rounded-2xl px-6 py-4 mb-6"
              style="border: 1px solid #e4e4e4"
            >
              <Row>
                <Column>
                  <Text class="text-sm text-muted-foreground m-0">Total</Text>
                </Column>
                <Column align="right">
                  <Text class="text-lg font-semibold text-foreground m-0">
                    {{ totalPrice.toFixed(2) }} €
                  </Text>
                </Column>
              </Row>
            </Section>

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
              Cet email confirme votre inscription. Conservez-le comme
              justificatif.
            </Text>

            <Row>
              <Column>
                <Text class="text-xs text-muted text-left m-0 mb-6">
                  © {{ new Date().getFullYear() }} ACD. Tous droits réservés.
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
      </Body>
    </Tailwind>
  </Html>
</template>
