import { createFileRoute } from "@tanstack/react-router";
import useEditorStore from "@/stores/editorStore";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { format, set } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { createJournal, JournalInput } from "@/types/createJournal";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/(app)/app/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const { content, reset, setState, title } = useEditorStore();
  const { register, control, handleSubmit, formState } = useForm({
    resolver: zodResolver(createJournal),
  });
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
  });
  useEffect(() => {
    editor?.commands.setContent(content || "<p></p>");
    const richText = editor?.getHTML();
    console.log("Rich Text (JSON):", richText);

    // Get plain text
    const plainText = editor?.getText({ blockSeparator: " " });
    console.log("Plain Text:", plainText);
  }, [content]);

  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");
  const onSubmit = (data: JournalInput) => {
    const { title, content } = data;
    console.log("Title:", title);
    console.log("Content:", content);
    setState({ title, content });
  };
  const onError = (errors: typeof formState.errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message.toString());
    }
  };

  return (
    <div className="h-full w-full p-5">
      <form
        className="flex h-full flex-col gap-5"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <section className="flex items-center justify-between">
          <Input
            className="rounded-none border-none px-0 py-2 font-bold shadow-none focus:outline-none focus-visible:ring-0 md:text-xl"
            id="title"
            placeholder="Give your story a nice title..."
            autoFocus
            defaultValue={title || ""}
            {...register("title", {
              onChange: (e) => setState({ title: e.target.value }),
            })}
          />
          <Button type="submit">Save Journal</Button>
        </section>
        <p className="text-xs text-gray-400">{currentDate}</p>
        <Controller
          name="content"
          control={control}
          render={({ field: { onChange, value } }) => (
            <MinimalTiptapEditor
              value={value}
              className="h-full w-full shadow-none"
              editorContentClassName="p-5"
              onChange={(value) => {
                setState({ content: value });
                onChange(value);
              }}
              placeholder="What's on your mind today ?..."
              editable={true}
              editorClassName="focus:outline-none"
              content={content}
              output="html"
            />
          )}
        />
      </form>
    </div>
  );
}
