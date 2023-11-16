import { BubbleMenu, BubbleMenuProps, isNodeSelection } from "@tiptap/react";
import React, {FC, ReactNode, useState} from "react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
} from "lucide-react";
import { NodeSelector } from "./node-selector";
import { ColorSelector } from "./color-selector";
import { LinkSelector } from "./link-selector";
import { cn } from "@/lib/utils";

export interface BubbleMenuItem {
  name: string;
  isActive: () => boolean;
  command: () => void;
  icon: typeof BoldIcon;
}

export interface BubbleMenuChild {
  Component: ReactNode;
  index: number;
}

export interface BubbleMenuModules {
    modules?: Array<BubbleMenuChild>;
}


export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

type EditorBubbleMenuProps = Omit<BubbleMenuProps, 'children'> & BubbleMenuModules;

export const EditorBubbleMenu: FC<EditorBubbleMenuProps> = (props) => {
  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);
  const [isLinkSelectorOpen, setIsLinkSelectorOpen] = useState(false);
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(-1);
  if (!props.editor)
    return <></>;



  const items: BubbleMenuItem[] = [
    {
      name: "bold",
      isActive: () => props.editor?.isActive("bold") ?? false,
      command: () => props.editor?.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: () => props.editor?.isActive("italic") ?? false,
      command: () => props.editor?.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: () => props.editor?.isActive("underline") ?? false,
      command: () => props.editor?.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      isActive: () => props.editor?.isActive("strike") ?? false,
      command: () => props.editor?.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: "code",
      isActive: () => props.editor?.isActive("code") ?? false,
      command: () => props.editor?.chain().focus().toggleCode().run(),
      icon: CodeIcon,
    },
  ];

  const modules: Array<BubbleMenuChild> = [
    {
      Component: <NodeSelector
          editor={props.editor}
          isOpen={isNodeSelectorOpen}
          setIsOpen={() => {
            setIsNodeSelectorOpen(!isNodeSelectorOpen);
            setIsColorSelectorOpen(false);
            setIsLinkSelectorOpen(false);
            setIsAdditionalOpen(-1);
          }}
      />,
      index: 0
    },
    {
      Component:
          <LinkSelector
              editor={props.editor}
              isOpen={isLinkSelectorOpen}
              setIsOpen={() => {
                setIsLinkSelectorOpen(!isLinkSelectorOpen);
                setIsColorSelectorOpen(false);
                setIsNodeSelectorOpen(false);
                setIsAdditionalOpen(-1);
              }}
          />,
      index: 1
    },
    {
      Component:
          <div className="novel-flex">
            {items.map((item, index) => (
                <button
                    key={index}
                    onClick={item.command}
                    className="novel-p-2 novel-text-stone-600 hover:novel-bg-stone-100 active:novel-bg-stone-200"
                    type="button"
                >
                  <item.icon
                      className={cn("novel-h-4 novel-w-4", {
                        "novel-text-blue-500": item.isActive(),
                      })}
                  />
                </button>
            ))}
          </div>
      ,
      index: 2
    },
    {
      Component:
          <ColorSelector
              editor={props.editor}
              isOpen={isColorSelectorOpen}
              setIsOpen={() => {
                setIsColorSelectorOpen(!isColorSelectorOpen);
                setIsNodeSelectorOpen(false);
                setIsLinkSelectorOpen(false);
                setIsAdditionalOpen(-1);
              }}
          />
      ,
      index: 3
    }
  ];

  const injectedPropModules: Array<BubbleMenuChild> = (props.modules && props.modules.reduce((acc: Array<BubbleMenuChild>, module) => {
    if (module.Component && React.isValidElement(module.Component)) {
      acc.push({
        Component: React.cloneElement(module.Component, {
          ...module.Component.props,
          editor: props.editor,
          setIsOpen: (index: number) => {
            setIsAdditionalOpen(index);
            setIsColorSelectorOpen(false);
            setIsNodeSelectorOpen(false);
            setIsLinkSelectorOpen(false);
          },
          isOpen: isAdditionalOpen === module.index,
          assignedIndex: module.index,
        } as any),
        index: module.index
      });
    }
    return acc;
  }, [])) ?? [];

  const mergedModules = [...modules, ...injectedPropModules ?? []]
      .sort((a, b) => a.index - b.index);


  const bubbleMenuProps: EditorBubbleMenuProps = {
    ...props,
    shouldShow: ({ state, editor }) => {
      const { selection } = state;
      const { empty } = selection;

      // don't show bubble menu if:
      // - the selected node is an image
      // - the selection is empty
      // - the selection is a node selection (for drag handles)
      if (editor.isActive("image") || empty || isNodeSelection(selection)) {
        return false;
      }
      return true;
    },
    tippyOptions: {
      moveTransition: "transform 0.15s ease-out",
      onHidden: () => {
        setIsNodeSelectorOpen(false);
        setIsColorSelectorOpen(false);
        setIsLinkSelectorOpen(false);
      },
    },
  };


  return (
    <BubbleMenu
      {...bubbleMenuProps}
      className="novel-flex novel-w-fit novel-divide-x novel-divide-stone-200 novel-rounded novel-border novel-border-stone-200 novel-bg-white novel-shadow-xl"
    >
      {mergedModules.map((module) => module.Component)}
    </BubbleMenu>
  );
};
