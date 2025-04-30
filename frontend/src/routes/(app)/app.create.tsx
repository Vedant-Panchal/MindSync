import { createFileRoute } from "@tanstack/react-router";
import useEditorStore from "@/stores/editorStore";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { createJournal, JournalInput } from "@/types/createJournal";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { TagInput } from "emblor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Save, SquarePen } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import API_PATHS from "@/config/api-paths";

export const Route = createFileRoute("/(app)/app/create")({
  component: RouteComponent,
});

const now = new Date();
const tomorrowMidnight = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate() + 1,
  0,
  0,
  0,
);
const tomorrowDate = format(tomorrowMidnight, "dd-MM-yyyy hh:mm a");

function RouteComponent() {
  const {
    richText,
    plainText,
    setState,
    title,
    tags,
    setActiveIndex,
    activeIndex,
    setTags,
  } = useEditorStore();
  const actionRef = useRef<"save" | "draft" | null>(null);

  const { mutate: addDraft, isPending: addingDraft } = useMutation({
    mutationKey: ["addDraft"],
    mutationFn: async (data: JournalInput) => {
      console.log(DataTransferItemList);
      await api.post(API_PATHS.JOURNALS.ADD_DRAFT, data);
    },
    onSuccess: () => {
      toast.success("Journal Saved Successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: addJournal, isPending: addingJournal } = useMutation({
    mutationKey: ["addJournal"],
    mutationFn: async (data: JournalInput) => {
      await api.post(API_PATHS.JOURNALS.SUBMIT, data);
    },
    onSuccess: () => {
      toast.success("Journal created successfully");
      useEditorStore.getState().reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { register, control, handleSubmit, formState, setValue } = useForm({
    resolver: zodResolver(createJournal),
    defaultValues: {
      title: title || "",
      tags: tags || [],
      richText: richText || "",
      plainText: plainText || "",
    },
  });

  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  const onSubmit = (data: JournalInput) => {
    if (actionRef.current === "save") {
      addJournal(data);
    } else if (actionRef.current === "draft") {
      console.log(data);
      addDraft(data);
    } else {
      toast.error("No action specified");
    }
    actionRef.current = null;
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
          <AlertDialog>
            <AlertDialogTrigger asChild className="flex items-center gap-2">
              <Button variant="default" type="button" disabled={addingJournal}>
                Save Journal <Save />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-semibold">
                  Are you sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You won't be able to submit another journal before{" "}
                  <span className="font-semibold">{tomorrowDate}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    actionRef.current = "save";
                    document.querySelector("form")?.requestSubmit();
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            type="submit"
            variant="secondary"
            className="ml-2 flex items-center"
            onClick={() => {
              actionRef.current = "draft";
            }}
            disabled={addingJournal}
          >
            Save Draft <SquarePen />
          </Button>
        </section>
        <p className="text-xs text-gray-400">{currentDate}</p>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagInput
              {...field}
              styleClasses={{ input: "shadow-none p-2 border-none" }}
              placeholder="Enter some topics to remember this journal by..."
              tags={field.value}
              setTags={(newTags) => {
                field.onChange(newTags);
                setTags(newTags);
              }}
              activeTagIndex={activeIndex}
              setActiveTagIndex={setActiveIndex}
              className="w-full"
            />
          )}
        />
        <Controller
          name="richText"
          control={control}
          render={({ field: { onChange, value } }) => (
            <MinimalTiptapEditor
              value={value || richText}
              onChange={(newContent) => {
                const html = newContent;

                const text = newContent
                  ? new DOMParser().parseFromString(
                      newContent as any,
                      "text/html",
                    ).body.textContent || ""
                  : "";
                onChange(html);
                setValue("plainText", text);
                setState({ richText: html, plainText: text });
              }}
              className="h-full w-full overflow-auto rounded-md border shadow-sm"
              editorContentClassName="p-5"
              placeholder="What's on your mind today?..."
              editable={true}
              editorClassName="focus:outline-none"
              output="html"
            />
          )}
        />
      </form>
    </div>
  );
}

export default RouteComponent;
