<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class:
        "prose prose-sm dark:prose-invert max-w-none min-h-[300px] focus:outline-none p-4",
    },
  },
  onUpdate({ editor }) {
    emit("update:modelValue", editor.getHTML());
  },
});

watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && editor.value.getHTML() !== val) {
      editor.value.commands.setContent(val, false);
    }
  },
);

onBeforeUnmount(() => editor.value?.destroy());

function toggleBold() {
  editor.value?.chain().focus().toggleBold().run();
}
function toggleItalic() {
  editor.value?.chain().focus().toggleItalic().run();
}
function toggleH2() {
  editor.value?.chain().focus().toggleHeading({ level: 2 }).run();
}
function toggleH3() {
  editor.value?.chain().focus().toggleHeading({ level: 3 }).run();
}
function toggleBulletList() {
  editor.value?.chain().focus().toggleBulletList().run();
}
function toggleOrderedList() {
  editor.value?.chain().focus().toggleOrderedList().run();
}
function setHorizontalRule() {
  editor.value?.chain().focus().setHorizontalRule().run();
}
</script>

<template>
  <div class="border rounded-lg overflow-hidden">
    <!-- Toolbar -->
    <div class="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor?.isActive('bold') }"
        @click="toggleBold"
      >
        <Icon name="lucide:bold" class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor?.isActive('italic') }"
        @click="toggleItalic"
      >
        <Icon name="lucide:italic" class="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" class="h-7 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor?.isActive('heading', { level: 2 }) }"
        @click="toggleH2"
      >
        <Icon name="lucide:heading-2" class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor?.isActive('heading', { level: 3 }) }"
        @click="toggleH3"
      >
        <Icon name="lucide:heading-3" class="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" class="h-7 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor?.isActive('bulletList') }"
        @click="toggleBulletList"
      >
        <Icon name="lucide:list" class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor?.isActive('orderedList') }"
        @click="toggleOrderedList"
      >
        <Icon name="lucide:list-ordered" class="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" class="h-7 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        @click="setHorizontalRule"
      >
        <Icon name="lucide:minus" class="h-4 w-4" />
      </Button>
    </div>

    <!-- Editor -->
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
.tiptap {
  p { margin: 0.5rem 0; }
  h2 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
  h3 { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.4rem; }
  ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
  ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
  hr { border-color: hsl(var(--border)); margin: 1rem 0; }
  strong { font-weight: 700; }
  em { font-style: italic; }
}
</style>
