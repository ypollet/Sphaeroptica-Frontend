<script setup lang="ts">
import MenubarItem from '../menubar/MenubarItem.vue';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog'
import { useForwardPropsEmits, type DialogRootEmits, type DialogRootProps } from 'radix-vue';

const props = defineProps<DialogRootProps &
{
    triggerChildren: string
    dialogTitle: string,
    dialogDescription?: string,
    disableTrigger?: boolean
}>()

const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)

function closeDialog(payload : boolean){
    console.log("close Dialog : ", payload)
    console.log(props.open)
    emits('update:open',payload)
}

</script>
<template>
    <Dialog v-bind="forwarded" @update:open="(payload : boolean) => closeDialog(payload)">
        <DialogTrigger asChild>
            <MenubarItem inset :disabled="props.disableTrigger" @select="(event: Event) => event.preventDefault()">
                {{ props.triggerChildren }}
            </MenubarItem>
        </DialogTrigger>
        <DialogContent class="w-4/5 max-h-5/6">
            <DialogHeader>
                <DialogTitle>{{ dialogTitle }}</DialogTitle>
                <DialogDescription>{{ dialogDescription }}</DialogDescription>
            </DialogHeader>
            <slot/>
        </DialogContent>
    </Dialog>
</template>