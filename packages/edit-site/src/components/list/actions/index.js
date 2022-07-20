/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	VisuallyHidden,
} from '@wordpress/components';
import { Icon, chevronDown, reset } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../../store';
import isTemplateRemovable from '../../../utils/is-template-removable';
import isTemplateRevertable from '../../../utils/is-template-revertable';
import RenameMenuItem from './rename-menu-item';

export default function Actions( { template } ) {
	const { removeTemplate, revertTemplate } = useDispatch( editSiteStore );
	const { saveEditedEntityRecord } = useDispatch( coreStore );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	const isRemovable = isTemplateRemovable( template );
	const isRevertable = isTemplateRevertable( template );

	if ( ! isRemovable && ! isRevertable ) {
		return (
			<>
				<Icon icon={ reset } />
				<VisuallyHidden>
					{ __( 'No actions available' ) }
				</VisuallyHidden>
			</>
		);
	}

	async function revertAndSaveTemplate() {
		try {
			await revertTemplate( template, { allowUndo: false } );
			await saveEditedEntityRecord(
				'postType',
				template.type,
				template.id
			);

			createSuccessNotice( __( 'Entity reverted.' ), {
				type: 'snackbar',
			} );
		} catch ( error ) {
			const errorMessage =
				error.message && error.code !== 'unknown_error'
					? error.message
					: __( 'An error occurred while reverting the entity.' );

			createErrorNotice( errorMessage, { type: 'snackbar' } );
		}
	}

	return (
		<DropdownMenu
			icon={ chevronDown }
			className="edit-site-list-table__actions"
			text={ __( 'Actions' ) }
			toggleProps={ {
				variant: 'tertiary',
				iconPosition: 'right',
			} }
		>
			{ ( { onClose } ) => (
				<MenuGroup>
					{ isRemovable && (
						<>
							<RenameMenuItem
								template={ template }
								onClose={ onClose }
							/>
							<MenuItem
								isDestructive
								isTertiary
								onClick={ () => {
									removeTemplate( template );
									onClose();
								} }
							>
								{ __( 'Delete' ) }
							</MenuItem>
						</>
					) }
					{ isRevertable && (
						<MenuItem
							info={ __( 'Restore to default state' ) }
							onClick={ () => {
								revertAndSaveTemplate();
								onClose();
							} }
						>
							{ __( 'Clear customizations' ) }
						</MenuItem>
					) }
				</MenuGroup>
			) }
		</DropdownMenu>
	);
}
