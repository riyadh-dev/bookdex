import { ICurrentUser } from '@/definitions/interfaces';
import { makePersisted } from '@solid-primitives/storage';
import { createSignal } from 'solid-js';

// eslint-disable-next-line solid/reactivity
export const isAuthModalOpenSignal = createSignal(false);
export const isAuthModalOpenAccessor = isAuthModalOpenSignal[0];
export const isAuthModalOpenSetter = isAuthModalOpenSignal[1];

// eslint-disable-next-line solid/reactivity
export const isAddBookModalOpenSignal = createSignal(false);
export const isAddBookModalOpenAccessor = isAddBookModalOpenSignal[0];
export const isAddBookModalOpenSetter = isAddBookModalOpenSignal[1];

// eslint-disable-next-line solid/reactivity
export const disableAuthActionsSignal = createSignal(false);
export const disableAuthActionsAccessor = disableAuthActionsSignal[0];
export const disableAuthActionsSetter = disableAuthActionsSignal[1];

export const currentUserSignal = makePersisted(
	// eslint-disable-next-line solid/reactivity
	createSignal<ICurrentUser | null>(null),
	{ name: 'current-user' },
);
export const currentUserSignalAccessor = currentUserSignal[0];
export const currentUserSignalSetter = currentUserSignal[1];
